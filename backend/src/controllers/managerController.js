
import {
  Hotel,
  Room,
  HotelImage, RoomImage,
  Booking,
  DynamicPricingRule,
  FlashDeal,
  Review,
  User,
  City,
} from '../models/index.js';

export const getMyHotel = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({
        success: false,
        error: { message: 'You do not have an assigned hotel.', status: 404 },
      });
    }

    const hotel = await Hotel.findByPk(req.user.hotel_id, {
      include: [
        { model: City, as: 'city' },
        { model: Room, as: 'rooms' },
        { model: DynamicPricingRule, as: 'pricingRules' },
        { model: FlashDeal, as: 'flashDeals' },
        { model: HotelImage, RoomImage, as: 'images' },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyHotel = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({
        success: false,
        error: { message: 'No assigned hotel found.', status: 404 },
      });
    }

    const hotel = await Hotel.findByPk(req.user.hotel_id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found.', status: 404 },
      });
    }

    const { name, description, address, check_in_time, check_out_time, base_price_per_night, latitude, longitude } = req.body;
    
    // Validate latitude and longitude if provided
    let updatedLat = hotel.latitude;
    let updatedLng = hotel.longitude;
    
    if (latitude !== undefined && longitude !== undefined) {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (!isNaN(latNum) && latNum >= -90 && latNum <= 90 && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
        updatedLat = latNum;
        updatedLng = lngNum;
      }
    }

    await hotel.update({
      name: name || hotel.name,
      description: description !== undefined ? description : hotel.description,
      address: address || hotel.address,
      latitude: updatedLat,
      longitude: updatedLng,
      check_in_time: check_in_time || hotel.check_in_time,
      check_out_time: check_out_time || hotel.check_out_time,
      base_price_per_night: base_price_per_night || hotel.base_price_per_night,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      data: hotel,
      message: 'Hotel updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Rooms Management
export const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: { hotel_id: req.user.hotel_id },
      include: [{ model: RoomImage, as: 'images' }],
      order: [['price_per_night', 'ASC']],
    });
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { room_type, price_per_night, capacity, available_rooms, total_rooms, description } = req.body;
    const availableCount = Number(available_rooms ?? total_rooms ?? 1);
    const room = await Room.create({
      hotel_id: req.user.hotel_id,
      room_type,
      price_per_night: Number(price_per_night),
      capacity: Number(capacity),
      available_rooms: availableCount,
      is_available: true,
      description: description || '',
      status: 'available',
    });

    res.status(201).json({ success: true, data: room, message: 'Room created.' });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found', status: 404 } });
    }

    const { room_type, price_per_night, capacity, available_rooms, is_available, description, status } = req.body;
    await room.update({
      room_type: room_type || room.room_type,
      price_per_night: price_per_night !== undefined ? Number(price_per_night) : room.price_per_night,
      capacity: capacity !== undefined ? Number(capacity) : room.capacity,
      available_rooms: available_rooms !== undefined ? Number(available_rooms) : room.available_rooms,
      is_available: is_available !== undefined ? Boolean(is_available) : room.is_available,
      description: description !== undefined ? description : room.description,
      status: status || room.status,
    });

    res.status(200).json({ success: true, data: room, message: 'Room updated.' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Room.destroy({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: { message: 'Room not found', status: 404 } });
    }
    res.status(200).json({ success: true, message: 'Room deleted.' });
  } catch (error) {
    next(error);
  }
};

// Bookings Management
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { hotel_id: req.user.hotel_id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone_number'] },
        { model: Room, as: 'room', attributes: ['id', 'room_type'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findOne({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (!booking) {
      return res.status(404).json({ success: false, error: { message: 'Booking not found', status: 404 } });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: { message: `Cannot change status of a ${booking.status} booking.`, status: 400 } });
    }

    await booking.update({ status, updated_at: new Date() });
    res.status(200).json({ success: true, data: booking, message: 'Booking status updated.' });
  } catch (error) {
    next(error);
  }
};

// Dynamic Pricing Rules Management
export const getPricingRules = async (req, res, next) => {
  try {
    const rules = await DynamicPricingRule.findAll({
      where: { hotel_id: req.user.hotel_id },
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

export const createPricingRule = async (req, res, next) => {
  try {
    const { rule_type, rule_target, multiplier, reason } = req.body;
    const rule = await DynamicPricingRule.create({
      hotel_id: req.user.hotel_id,
      rule_type: rule_type || null,
      rule_target: rule_target || null,
      multiplier: multiplier !== undefined ? Number(multiplier) : 1.0,
      // fallback for old fields to keep DB happy
      season_factor: 1.0,
      occupancy_factor: 1.0,
      event_factor: 1.0,
      weekend_factor: 1.0,
      manual_factor: 1.0,
      reason: reason || '',
      is_active: true,
    });
    res.status(201).json({ success: true, data: rule, message: 'Pricing rule created.' });
  } catch (error) {
    next(error);
  }
};

export const updatePricingRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await DynamicPricingRule.findOne({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (!rule) {
      return res.status(404).json({ success: false, error: { message: 'Rule not found', status: 404 } });
    }
    const { rule_type, rule_target, multiplier, reason, is_active } = req.body;
    await rule.update({
      rule_type: rule_type !== undefined ? rule_type : rule.rule_type,
      rule_target: rule_target !== undefined ? rule_target : rule.rule_target,
      multiplier: multiplier !== undefined ? Number(multiplier) : rule.multiplier,
      reason: reason !== undefined ? reason : rule.reason,
      is_active: is_active !== undefined ? Boolean(is_active) : rule.is_active,
      updated_at: new Date(),
    });
    res.status(200).json({ success: true, data: rule, message: 'Pricing rule updated.' });
  } catch (error) {
    next(error);
  }
};

export const deletePricingRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await DynamicPricingRule.destroy({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: { message: 'Rule not found', status: 404 } });
    }
    res.status(200).json({ success: true, message: 'Rule deleted.' });
  } catch (error) {
    next(error);
  }
};

// Flash Deals Management
export const getFlashDeals = async (req, res, next) => {
  try {
    const deals = await FlashDeal.findAll({
      where: { hotel_id: req.user.hotel_id },
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
};

export const createFlashDeal = async (req, res, next) => {
  try {
    const {
      room_id,
      title,
      description,
      discount_percentage,
      discount_type,
      discount_value,
      priority,
      start_datetime,
      end_datetime,
      remaining_rooms,
    } = req.body;

    const deal = await FlashDeal.create({
      hotel_id: req.user.hotel_id,
      room_id: room_id ? Number(room_id) : null,
      title: title || 'Special Offer',
      description: description || '',
      discount_percentage: Number(discount_percentage || 10),
      discount_type: discount_type || 'percentage',
      discount_value: discount_value ? Number(discount_value) : null,
      priority: Number(priority || 0),
      start_datetime: start_datetime || new Date(),
      end_datetime: end_datetime || new Date(Date.now() + 7 * 86400000),
      remaining_rooms: Number(remaining_rooms || 10),
      active_status: true,
    });
    res.status(201).json({ success: true, data: deal, message: 'Flash deal created.' });
  } catch (error) {
    next(error);
  }
};

export const updateFlashDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deal = await FlashDeal.findOne({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (!deal) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found', status: 404 } });
    }

    await deal.update({ ...req.body, updated_at: new Date() });
    res.status(200).json({ success: true, data: deal, message: 'Flash deal updated.' });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await FlashDeal.destroy({
      where: { id: Number(id), hotel_id: req.user.hotel_id },
    });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found', status: 404 } });
    }
    res.status(200).json({ success: true, message: 'Flash deal deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getCompetitorBenchmarking = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({
        success: false,
        error: { message: 'You do not have an assigned hotel.', status: 404 },
      });
    }

    const myHotel = await Hotel.findByPk(req.user.hotel_id, {
      include: [
        { model: City, as: 'city' },
        { model: Review, as: 'reviews' },
        { model: Room, as: 'rooms' },
      ],
    });

    if (!myHotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found.', status: 404 },
      });
    }

    // My Rating
    const myAvgRating =
      myHotel.reviews && myHotel.reviews.length > 0
        ? Number(
            (
              myHotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating), 0) /
              myHotel.reviews.length
            ).toFixed(1)
          )
        : Number(myHotel.star_rating);

    // My Occupancy
    const myBookings = await Booking.findAll({ where: { hotel_id: myHotel.id, status: 'confirmed' } });
    const myTotalBookedNights = myBookings.reduce((sum, b) => sum + b.total_nights, 0);
    const myTotalRooms = myHotel.rooms ? myHotel.rooms.reduce((sum, r) => sum + (r.available_rooms || 1), 0) : 1;
    const myOccupancy = myTotalRooms > 0 
      ? Math.min(100, (myTotalBookedNights / (myTotalRooms * 30)) * 100) 
      : 0;
    const myAvgPrice = Number(myHotel.base_price_per_night);

    // Competitors
    const competitorHotels = await Hotel.findAll({
      where: {
        city_id: myHotel.city_id,
        star_rating: myHotel.star_rating,
      },
      include: [
        { model: Review, as: 'reviews' },
        { model: Room, as: 'rooms' },
      ],
    });

    const otherHotels = competitorHotels.filter((h) => h.id !== myHotel.id);
    const totalCompetitors = otherHotels.length;

    let marketAvgPrice = 0;
    let marketAvgRating = 0;
    let marketAvgOccupancy = 0;

    if (totalCompetitors > 0) {
      // Market Price
      marketAvgPrice = Number(
        (
          otherHotels.reduce((sum, h) => sum + Number(h.base_price_per_night || 0), 0) /
          totalCompetitors
        ).toFixed(2)
      );

      // Market Rating
      let totalReviewsCount = 0;
      let totalRatingSum = 0;
      otherHotels.forEach((h) => {
        if (h.reviews && h.reviews.length > 0) {
          h.reviews.forEach((r) => {
            totalRatingSum += Number(r.overall_rating);
            totalReviewsCount += 1;
          });
        }
      });
      marketAvgRating =
        totalReviewsCount > 0
          ? Number((totalRatingSum / totalReviewsCount).toFixed(1))
          : Number(myHotel.star_rating);

      // Market Occupancy
      const otherHotelIds = otherHotels.map(h => h.id);
      const compBookings = await Booking.findAll({ where: { hotel_id: otherHotelIds, status: 'confirmed' } });
      const compTotalBookedNights = compBookings.reduce((sum, b) => sum + b.total_nights, 0);
      const compTotalRooms = otherHotels.reduce((sum, h) => {
        return sum + (h.rooms ? h.rooms.reduce((rSum, r) => rSum + (r.available_rooms || 1), 0) : 1);
      }, 0);
      
      marketAvgOccupancy = compTotalRooms > 0 
        ? Math.min(100, (compTotalBookedNights / (compTotalRooms * 30)) * 100) 
        : 0;

    } else {
      // Fallbacks if no competitors
      marketAvgPrice = myAvgPrice;
      marketAvgRating = myAvgRating;
      marketAvgOccupancy = myOccupancy;
    }

    const priceDiffPercent = marketAvgPrice > 0
      ? Number((((myAvgPrice - marketAvgPrice) / marketAvgPrice) * 100).toFixed(1))
      : 0;

    const ratingDiff = Number((myAvgRating - marketAvgRating).toFixed(1));
    const occupancyDiff = Number((myOccupancy - marketAvgOccupancy).toFixed(1));

    let priceInsights = '';
    if (priceDiffPercent < -5) {
      priceInsights = `Your average room price is ${Math.abs(priceDiffPercent)}% below the market average. Consider raising prices to capture more revenue if occupancy allows.`;
    } else if (priceDiffPercent > 5) {
      priceInsights = `Your average room price is ${priceDiffPercent}% above the market average. Ensure your amenities justify the premium.`;
    } else {
      priceInsights = `Your average room price is aligned with the local market.`;
    }

    let occInsights = '';
    if (occupancyDiff < -5) {
      occInsights = `Your occupancy is ${Math.abs(occupancyDiff)} percentage points below the market average. Consider running a Flash Deal.`;
    } else if (occupancyDiff > 5) {
      occInsights = `Your occupancy is ${occupancyDiff} percentage points above the market average! Great job capturing demand.`;
    } else {
      occInsights = `Your occupancy matches the local market average.`;
    }

    let ratInsights = '';
    if (ratingDiff < -0.2) {
      ratInsights = `Your hotel rating is below the market average. Focus on improving guest satisfaction.`;
    } else if (ratingDiff > 0.2) {
      ratInsights = `Your hotel rating is above the market average. Keep up the excellent service!`;
    } else {
      ratInsights = `Your hotel rating is on par with the market average.`;
    }

    res.status(200).json({
      success: true,
      data: {
        myHotel: {
          id: myHotel.id,
          name: myHotel.name,
          city_name: myHotel.city ? myHotel.city.name : 'Unknown',
          star_rating: Number(myHotel.star_rating),
          avg_base_price: myAvgPrice,
          avg_guest_rating: myAvgRating,
          occupancy_rate: Number(myOccupancy.toFixed(1)),
        },
        marketAverage: {
          total_competitors: totalCompetitors,
          avg_base_price: Number(marketAvgPrice.toFixed(2)),
          avg_guest_rating: Number(marketAvgRating.toFixed(1)),
          avg_occupancy_rate: Number(marketAvgOccupancy.toFixed(1)),
        },
        differences: {
          price_difference_percentage: priceDiffPercent,
          price_difference_amount: Number((myAvgPrice - marketAvgPrice).toFixed(2)),
          rating_difference: ratingDiff,
          occupancy_difference: occupancyDiff,
        },
        insights: [priceInsights, occInsights, ratInsights],
      },
    });
  } catch (error) {
    next(error);
  }
};;


export const updateHotelCurrency = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }

    const { currency } = req.body;
    if (!currency || !['EUR', 'USD'].includes(currency)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid currency. Only EUR and USD are supported.', status: 400 } });
    }

    const hotel = await Hotel.findByPk(req.user.hotel_id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found.', status: 404 } });
    }

    const oldCurrency = hotel.currency || 'EUR';

    if (oldCurrency !== currency) {
      const { sequelize } = await import('../models/index.js');
      const transaction = await sequelize.transaction();
      
      try {
        if (hotel.base_price_per_night) {
          const convertedBase = convertPrice(Number(hotel.base_price_per_night), oldCurrency, currency);
          hotel.base_price_per_night = convertedBase.toFixed(2);
        }
        hotel.currency = currency;
        hotel.updated_at = new Date();
        await hotel.save({ transaction });

        const rooms = await Room.findAll({ where: { hotel_id: hotel.id }, transaction });
        for (const room of rooms) {
          if (room.price_per_night) {
            const convertedPrice = convertPrice(Number(room.price_per_night), oldCurrency, currency);
            room.price_per_night = convertedPrice.toFixed(2);
            await room.save({ transaction });
          }
        }
        
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    }

    res.status(200).json({ success: true, data: hotel, message: 'Hotel currency updated.' });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file provided or invalid format.', status: 400 } });
    }

    const hotelIdStr = req.user.hotel_id.toString().padStart(3, '0');
    const dbPath = `/uploads/hotels/hotel-${hotelIdStr}/${req.file.filename}`;

    const newImage = await HotelImage.create({
      hotel_id: req.user.hotel_id,
      image_url: dbPath,
      is_primary: false,
      display_order: 0
    });

    res.status(201).json({ success: true, data: newImage, message: 'Image uploaded successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }

    const { imageId } = req.params;
    const image = await HotelImage.findOne({ where: { id: imageId, hotel_id: req.user.hotel_id } });

    if (!image) {
      return res.status(404).json({ success: false, error: { message: 'Image not found or not owned by your hotel.', status: 404 } });
    }

    if (image.image_url) {
      const fs = await import('fs');
      const path = await import('path');
      const physicalPath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    }

    await image.destroy();
    res.status(200).json({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    next(error);
  }
};


export const uploadRoomImage = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }
    const { id: roomId } = req.params;
    const room = await Room.findOne({ where: { id: roomId, hotel_id: req.user.hotel_id } });
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found or not owned by your hotel.', status: 404 } });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No image provided.', status: 400 } });
    }

    const hotelIdStr = req.user.hotel_id.toString().padStart(3, '0');
    const imageUrl = `/uploads/hotels/hotel-${hotelIdStr}/${req.file.filename}`;

    const newImage = await RoomImage.create({
      room_id: roomId,
      image_url: imageUrl,
      is_primary: false,
    });

    res.status(201).json({ success: true, data: newImage, message: 'Room image uploaded successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomImage = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }
    const { roomId, imageId } = req.params;
    const room = await Room.findOne({ where: { id: roomId, hotel_id: req.user.hotel_id } });
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found or not owned by your hotel.', status: 404 } });
    }

    const image = await RoomImage.findOne({ where: { id: imageId, room_id: roomId } });
    if (!image) {
      return res.status(404).json({ success: false, error: { message: 'Image not found.', status: 404 } });
    }

    if (image.image_url) {
      const fs = await import('fs');
      const path = await import('path');
      const physicalPath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    }

    await image.destroy();
    res.status(200).json({ success: true, message: 'Room image deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateRoomStatus = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status.', status: 400 } });
    }

    const room = await Room.findOne({ where: { id, hotel_id: req.user.hotel_id } });
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found.', status: 404 } });
    }

    room.status = status;
    await room.save();

    res.status(200).json({ success: true, data: room, message: 'Room status updated.' });
  } catch (error) {
    next(error);
  }
};

export const updateRoomAvailability = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({ success: false, error: { message: 'No assigned hotel found.', status: 404 } });
    }
    const { id } = req.params;
    const { available_rooms } = req.body;

    if (typeof available_rooms !== 'number' || available_rooms < 0) {
      return res.status(400).json({ success: false, error: { message: 'Invalid count.', status: 400 } });
    }

    const room = await Room.findOne({ where: { id, hotel_id: req.user.hotel_id } });
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found.', status: 404 } });
    }

    room.available_rooms = available_rooms;
    await room.save();

    res.status(200).json({ success: true, data: room, message: 'Available rooms updated.' });
  } catch (error) {
    next(error);
  }
};
