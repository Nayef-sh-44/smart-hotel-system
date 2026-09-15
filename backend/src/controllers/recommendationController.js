import { calculatePricing } from '../services/pricingService.js';
import {
  Hotel,
  City,
  Room,
  Amenity,
  Review,
  DynamicPricingRule,
  FlashDeal,
  Favorite,
  HotelImage
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
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false },
        { model: HotelImage, as: 'images' }
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

    
    const scoredHotels = allHotels.map((hotel) => {
      const hotelObj = hotel.toJSON ? hotel.toJSON() : hotel;
      if (hotelObj.rooms && hotelObj.rooms.length > 0) {
        const minRoomPrice = Math.min(...hotelObj.rooms.map(r => Number(r.price_per_night)));
        try {
          const reqNumRooms = Number(req.query.rooms || 1);
          const checkInDate = req.query.check_in_date ? new Date(req.query.check_in_date) : new Date();
          const checkOutDate = req.query.check_out_date ? new Date(req.query.check_out_date) : new Date(checkInDate.getTime() + 86400000);
          
          const pricingData = calculatePricing(
            checkInDate,
            checkOutDate,
            minRoomPrice,
            hotelObj.pricingRules || [],
            reqNumRooms,
            hotelObj.city?.country || '',
            hotelObj.flashDeals || []
          );
          hotelObj.starting_price = pricingData.totalPrice / Math.max(1, (checkOutDate - checkInDate) / 86400000) / reqNumRooms;
        } catch (e) {
          hotelObj.starting_price = minRoomPrice;
        }
      } else {
        hotelObj.starting_price = null;
      }

      const matchReasons = [];
      
      // 1. Budget Alignment (30%)
      let budgetScore = 100;
      if (targetBudgetUsd) {
        const basePriceUsd = Number(hotel.base_price_per_night || 200);
        const diffRatio = Math.abs(basePriceUsd - targetBudgetUsd) / targetBudgetUsd;
        budgetScore = Math.max(0, 100 - (diffRatio * 100));
        if (budgetScore >= 85) {
          matchReasons.push('Great match for your target budget');
        }
      }

      // 2. Rating (25%)
      const starRating = Number(hotel.star_rating || 3);
      let avgOverall = starRating;
      let avgLocation = 4.0; // Default location rating

      if (hotel.reviews && hotel.reviews.length > 0) {
        const sumOverall = hotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating || 5), 0);
        const sumLocation = hotel.reviews.reduce((acc, r) => acc + Number(r.location_rating || 4), 0);
        avgOverall = sumOverall / hotel.reviews.length;
        avgLocation = sumLocation / hotel.reviews.length;
      }

      const ratingScore = ((starRating + avgOverall) / 2 / 5) * 100;
      if (ratingScore >= 90) {
        matchReasons.push('Exceptional guest rating');
      }

      // 3. Services/Amenities (20%)
      let servicesScore = 100;
      const hotelAmenityIds = (hotel.amenities || []).map((a) => a.id);
      if (userAmenityIds.length > 0) {
        const matched = userAmenityIds.filter(id => hotelAmenityIds.includes(id)).length;
        servicesScore = (matched / userAmenityIds.length) * 100;
        if (servicesScore >= 100) {
          matchReasons.push('Includes your preferred amenities');
        }
      } else {
        servicesScore = Math.min(100, (hotelAmenityIds.length / 10) * 100);
      }

      // 4. Location (15%)
      const locationScore = (avgLocation / 5) * 100;
      if (locationScore >= 90) {
        matchReasons.push('Highly rated location');
      }

      // 5. Favorites (10%)
      const isFavorite = userFavoritesData.some(fav => fav.hotel_id === hotel.id);
      const favoritesScore = isFavorite ? 100 : 0;
      if (isFavorite) {
        matchReasons.push('One of your Favorite Hotels');
      }

      // Final Weighted Score Calculation
      const finalScoreRaw = 
        (budgetScore * 0.30) + 
        (ratingScore * 0.25) + 
        (servicesScore * 0.20) + 
        (locationScore * 0.15) + 
        (favoritesScore * 0.10);

      const finalScore = Math.round(finalScoreRaw);
      
      return {
        hotel: hotelObj,
        recommendationScore: finalScore,
        recommendationMatchPercentage: finalScore, // Expose directly as exactly 0-100
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
