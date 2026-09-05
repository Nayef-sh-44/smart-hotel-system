import {
  Hotel,
  City,
  Room,
  Amenity,
  Review,
  DynamicPricingRule,
  FlashDeal,
  Favorite
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

    const userFavoritesData = req.user ? await Favorite.findAll({ 
      where: { user_id: req.user.id },
      include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'city_id'] }]
    }) : [];

    const calculateFavoritePreference = (hotel, userFavorites, searchRegionId) => {
      let favoriteScore = 0;
      let isFavorite = false;
      
      if (!userFavorites || userFavorites.length === 0) {
        return { favoriteScore, isFavorite };
      }

      const hotelRegion = hotel.city_id;
      
      // Condition 1: Only consider favorites in the searchRegion
      const regionalFavorites = userFavorites.filter(fav => fav.hotel && fav.hotel.city_id === searchRegionId);

      // Only apply favorite logic if the hotel belongs to the search region
      if (hotelRegion === searchRegionId && regionalFavorites.length > 0) {
        // Condition 2: Is the hotel itself a favorite?
        isFavorite = regionalFavorites.some(fav => fav.hotel_id === hotel.id);
        if (isFavorite) {
          favoriteScore += 15; // Moderate boost
        }
        
        // Condition 3: Pattern preference in the region
        if (regionalFavorites.length === 1) {
          favoriteScore += 3;
        } else if (regionalFavorites.length >= 2) {
          favoriteScore += Math.min(8, regionalFavorites.length * 2);
        }
      }

      return { favoriteScore, isFavorite };
    };

    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];
      
      // Determine searchRegion from the currently evaluated hotel (since allHotels is already filtered by search query)
      const searchRegionId = hotel.city_id;
      
      const { favoriteScore, isFavorite } = calculateFavoritePreference(hotel, userFavoritesData, searchRegionId);
      
      if (favoriteScore > 0) {
        score += favoriteScore;
      }
      if (isFavorite) {
        matchReasons.push('One of your Favorite Hotels');
      }

      // 1. Star Rating
      const starRating = Number(hotel.star_rating || 0);
      score += starRating * 15;
      if (starRating >= 4.5) {
        matchReasons.push('Luxury 5-star experience');
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
      
      const finalScore = Math.round(score);
      
      // 10. Logging / Debug
      console.log(`[Recommendation DEBUG] hotelId=${hotel.id}, hotelRegion=${hotel.city_id}, searchRegion=${searchRegionId}, isFavorite=${isFavorite}, favoritePreferenceScore=${favoriteScore}, finalRecommendationScore=${finalScore}`);

      return {
        hotel,
        recommendationScore: finalScore,
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
