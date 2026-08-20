import {
  Hotel,
  City,
  Room,
  Amenity,
  Review,
  NearbyService,
  TouristAttraction,
  SavedComparison,
} from '../models/index.js';

export const getSideBySideComparison = async (req, res, next) => {
  try {
    const { hotel_ids } = req.body;
    if (!hotel_ids || !Array.isArray(hotel_ids) || hotel_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide at least 2 hotel IDs to compare.', status: 400 },
      });
    }

    const ids = hotel_ids.slice(0, 4).map((id) => Number(id));

    const hotels = await Hotel.findAll({
      where: { id: ids },
      include: [
        {
          model: City,
          as: 'city',
        },
        {
          model: Amenity,
          as: 'amenities',
          through: { attributes: ['is_free', 'additional_cost'] },
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
          model: NearbyService,
          as: 'nearbyServices',
        },
        {
          model: TouristAttraction,
          as: 'attractions',
        },
      ],
    });

    // Build unified amenity matrix
    const amenityMap = new Map();
    hotels.forEach((hotel) => {
      (hotel.amenities || []).forEach((amenity) => {
        if (!amenityMap.has(amenity.id)) {
          amenityMap.set(amenity.id, {
            id: amenity.id,
            name: amenity.name,
            category: amenity.category,
            icon_class: amenity.icon_class,
            hotelAvailability: {},
          });
        }
        const entry = amenityMap.get(amenity.id);
        entry.hotelAvailability[hotel.id] = {
          available: true,
          is_free: amenity.HotelAmenity ? amenity.HotelAmenity.is_free : true,
          additional_cost: amenity.HotelAmenity ? amenity.HotelAmenity.additional_cost : null,
        };
      });
    });

    // Ensure all compared hotels have an entry in hotelAvailability for every amenity
    const amenityMatrix = Array.from(amenityMap.values()).map((item) => {
      ids.forEach((hid) => {
        if (!item.hotelAvailability[hid]) {
          item.hotelAvailability[hid] = { available: false, is_free: false, additional_cost: null };
        }
      });
      return item;
    });

    // Compute rating breakdown
    const hotelComparisons = hotels.map((h) => {
      const reviews = h.reviews || [];
      const totalReviews = reviews.length;
      const getAvg = (field) => {
        if (totalReviews === 0) return 0;
        return (
          reviews.reduce((acc, r) => acc + Number(r[field] || 5), 0) / totalReviews
        ).toFixed(1);
      };

      return {
        id: h.id,
        name: h.name,
        city: h.city ? h.city.name : '',
        address: h.address,
        star_rating: Number(h.star_rating),
        base_price_per_night: Number(h.base_price_per_night),
        primary_image_url: h.primary_image_url,
        roomTypes: (h.rooms || []).map((r) => ({
          type: r.room_type,
          price: Number(r.price_per_night),
          capacity: r.capacity,
          available_rooms: r.available_rooms,
        })),
        ratings: {
          overall: Number(getAvg('overall_rating')),
          cleanliness: Number(getAvg('cleanliness_rating')),
          location: Number(getAvg('location_rating')),
          service: Number(getAvg('service_rating')),
          value: Number(getAvg('value_rating')),
          reviewCount: totalReviews,
        },
        nearbyServicesCount: (h.nearbyServices || []).length,
        attractionsCount: (h.attractions || []).length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        hotels: hotelComparisons,
        amenityMatrix,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedComparisons = async (req, res, next) => {
  try {
    const comparisons = await SavedComparison.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: comparisons,
    });
  } catch (error) {
    next(error);
  }
};

export const createSavedComparison = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.suite_name;
    const { hotel_ids } = req.body;
    if (!title || !hotel_ids || !Array.isArray(hotel_ids)) {
      return res.status(400).json({
        success: false,
        error: { message: 'title and hotel_ids array are required', status: 400 },
      });
    }

    const comparison = await SavedComparison.create({
      user_id: req.user.id,
      title,
      hotel_ids: hotel_ids.join(','),
    });

    res.status(201).json({
      success: true,
      data: comparison,
      message: 'Comparison list saved.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedComparison = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SavedComparison.destroy({
      where: {
        id: Number(id),
        user_id: req.user.id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Saved comparison not found', status: 404 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comparison deleted.',
    });
  } catch (error) {
    next(error);
  }
};
