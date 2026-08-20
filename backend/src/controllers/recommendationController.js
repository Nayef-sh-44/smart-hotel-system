import {
  Hotel,
  City,
  Room,
  Amenity,
  Review,
  DynamicPricingRule,
  FlashDeal,
} from '../models/index.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const {
      city_id,
      target_price,
      min_stars = 1,
      amenities = '',
      limit = 10,
    } = req.query;

    const targetCityId = city_id ? Number(city_id) : null;

    const whereClause = targetCityId ? { city_id: targetCityId } : {};

    const allHotels = await Hotel.findAll({
      where: whereClause,
      include: [
        {
          model: City,
          as: 'city',
        },
        {
          model: Amenity,
          as: 'amenities',
          through: { attributes: ['is_free'] },
        },
        {
          model: Room,
          as: 'rooms',
        },
        {
          model: Review,
          as: 'reviews',
          where: { is_approved: true },
          required: false,
        },
        {
          model: DynamicPricingRule,
          as: 'pricingRules',
          where: { is_active: true },
          required: false,
        },
        {
          model: FlashDeal,
          as: 'flashDeals',
          where: { active_status: true },
          required: false,
        },
      ],
    });

    const userAmenityIds = amenities
      ? amenities.split(',').map((a) => Number(a.trim()))
      : [];
    const targetPriceNum = target_price ? Number(target_price) : 500;

    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];

      // 1. Star Rating (Weight 1.5)
      const starRating = Number(hotel.star_rating || 0);
      score += starRating * 15;
      if (starRating >= 4.5) {
        matchReasons.push('Luxury 5-star experience');
      }


      // 3. Price Proximity (Weight 2.0)
      const basePrice = Number(hotel.base_price_per_night || 200);
      const priceDiff = Math.abs(basePrice - targetPriceNum);
      const priceScore = Math.max(0, 50 - (priceDiff / targetPriceNum) * 30);
      score += priceScore;
      if (priceDiff <= targetPriceNum * 0.15) {
        matchReasons.push('Great match for your target budget');
      }

      // 4. Amenity Overlap Score
      let amenityScore = 0;
      const hotelAmenityIds = (hotel.amenities || []).map((a) => a.id);
      if (userAmenityIds.length > 0) {
        userAmenityIds.forEach((id) => {
          if (hotelAmenityIds.includes(id)) {
            amenityScore += 12;
          }
        });
        score += amenityScore;
        if (amenityScore >= 24) {
          matchReasons.push('Includes your preferred amenities');
        }
      } else {
        score += Math.min(20, hotel.amenities.length * 3);
      }

      // 5. Review Rating Sentiment
      let avgReviewScore = 0;
      if (hotel.reviews && hotel.reviews.length > 0) {
        const sum = hotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating || 5), 0);
        avgReviewScore = sum / hotel.reviews.length;
        score += avgReviewScore * 8;
        if (avgReviewScore >= 4.5) {
          matchReasons.push('Exceptional guest rating');
        }
      } else {
        score += 32; // Default baseline for unreviewed hotels
      }

      // 6. Active Flash Deals / Special Value
      if (hotel.flashDeals && hotel.flashDeals.length > 0) {
        score += 25;
        matchReasons.push('Active Flash Deal available');
      }

      return {
        hotel,
        recommendationScore: Math.round(score),
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Recommended for overall quality & comfort'],
      };
    });

    // Sort by recommendationScore DESC
    scoredHotels.sort((a, b) => b.recommendationScore - a.recommendationScore);

    const result = scoredHotels.slice(0, Number(limit));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
