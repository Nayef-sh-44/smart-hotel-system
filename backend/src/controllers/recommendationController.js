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
      limit = 3,
      hotel_ids,
      trip_type
    } = req.query;

    let whereClause = {};

    // 1. Same Dataset Rule: If frontend provides hotel_ids, ONLY rank these exact hotels.
    if (hotel_ids) {
      const ids = hotel_ids.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
      if (ids.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      whereClause.id = ids;
    } else {
      // Fallback if not provided
      const targetCityId = city_id ? Number(city_id) : null;
      if (targetCityId) {
        whereClause.city_id = targetCityId;
      }
    }

    const allHotels = await Hotel.findAll({
      where: whereClause,
      include: [
        { model: City, as: 'city' },
        { model: Amenity, as: 'amenities', through: { attributes: ['is_free'] } },
        { model: Room, as: 'rooms' },
        { model: Review, as: 'reviews', where: { is_approved: true }, required: false },
        { model: DynamicPricingRule, as: 'pricingRules', where: { is_active: true }, required: false },
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
      ]
    });

    const userAmenityIds = amenities ? amenities.split(',').map((a) => Number(a.trim())) : [];
    const targetPriceNum = target_price ? Number(target_price) : null;
    const userCurrency = req.query.user_currency || 'USD';
    const targetBudgetUsd = targetPriceNum ? (userCurrency === 'EUR' ? targetPriceNum * 1.10 : targetPriceNum) : null;

    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];

      // 1. Star Rating
      const starRating = Number(hotel.star_rating || 0);
      score += starRating * 15;
      if (starRating >= 4.5) {
        matchReasons.push('Luxury 5-star experience');
      }

      // 2. Trip Type Alignment (Indirect influence based on amenities/features)
      if (trip_type) {
        const hotelAmenityNames = (hotel.amenities || []).map(a => a.name.toLowerCase());
        let tripScore = 0;
        
        if (trip_type.toLowerCase() === 'business') {
          if (hotelAmenityNames.some(name => name.includes('wifi') || name.includes('wi-fi'))) tripScore += 10;
          if (hotelAmenityNames.some(name => name.includes('business') || name.includes('meeting'))) tripScore += 15;
        } else if (trip_type.toLowerCase() === 'family') {
          if (hotelAmenityNames.some(name => name.includes('pool') || name.includes('family'))) tripScore += 15;
          if (hotel.rooms && hotel.rooms.some(r => r.capacity >= 4)) tripScore += 10;
        } else if (trip_type.toLowerCase() === 'couple') {
          if (hotelAmenityNames.some(name => name.includes('spa') || name.includes('massage') || name.includes('dining'))) tripScore += 15;
        } else if (trip_type.toLowerCase() === 'solo') {
           if (hotelAmenityNames.some(name => name.includes('wifi') || name.includes('bar') || name.includes('gym'))) tripScore += 10;
        }
        
        if (tripScore > 0) {
          matchReasons.push(`Great for ${trip_type} trips`);
        }
        score += tripScore;
      }

      // 3. Price Proximity
      if (targetBudgetUsd) {
        const basePriceUsd = Number(hotel.base_price_per_night || 200);
        const priceDiff = Math.abs(basePriceUsd - targetBudgetUsd);
        const priceScore = Math.max(0, 50 - (priceDiff / targetBudgetUsd) * 30);
        score += priceScore;
        if (priceDiff <= targetBudgetUsd * 0.15) {
          matchReasons.push('Great match for your target budget');
        }
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

      // 6. Active Flash Deals
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

    // Limit is up to the filtered dataset, max what the frontend asked for (3)
    const result = scoredHotels.slice(0, Math.min(Number(limit) || 3, allHotels.length));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
