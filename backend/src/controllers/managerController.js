import {
  Hotel,
  Room,
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

    const { name, description, address, check_in_time, check_out_time, base_price_per_night } = req.body;
    await hotel.update({
      name: name || hotel.name,
      description: description !== undefined ? description : hotel.description,
      address: address || hotel.address,
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
    const { season_factor, occupancy_factor, event_factor, weekend_factor, manual_factor, reason } = req.body;
    const rule = await DynamicPricingRule.create({
      hotel_id: req.user.hotel_id,
      season_factor: Number(season_factor || 1.0),
      occupancy_factor: Number(occupancy_factor || 1.0),
      event_factor: Number(event_factor || 1.0),
      weekend_factor: Number(weekend_factor || 1.0),
      manual_factor: Number(manual_factor || 1.0),
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
    const { season_factor, occupancy_factor, event_factor, weekend_factor, manual_factor, reason, is_active } = req.body;
    await rule.update({
      season_factor: season_factor !== undefined ? Number(season_factor) : rule.season_factor,
      occupancy_factor: occupancy_factor !== undefined ? Number(occupancy_factor) : rule.occupancy_factor,
      event_factor: event_factor !== undefined ? Number(event_factor) : rule.event_factor,
      weekend_factor: weekend_factor !== undefined ? Number(weekend_factor) : rule.weekend_factor,
      manual_factor: manual_factor !== undefined ? Number(manual_factor) : rule.manual_factor,
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

    const myAvgRating =
      myHotel.reviews && myHotel.reviews.length > 0
        ? Number(
            (
              myHotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating), 0) /
              myHotel.reviews.length
            ).toFixed(1)
          )
        : Number(myHotel.star_rating);

    const competitorHotels = await Hotel.findAll({
      where: {
        city_id: myHotel.city_id,
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
    let marketAvgStarRating = 0;

    if (totalCompetitors > 0) {
      marketAvgPrice = Number(
        (
          otherHotels.reduce((sum, h) => sum + Number(h.base_price_per_night || 0), 0) /
          totalCompetitors
        ).toFixed(2)
      );

      marketAvgStarRating = Number(
        (
          otherHotels.reduce((sum, h) => sum + Number(h.star_rating || 4), 0) /
          totalCompetitors
        ).toFixed(1)
      );

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
          : marketAvgStarRating;
    } else {
      marketAvgPrice = Number(myHotel.base_price_per_night);
      marketAvgRating = myAvgRating;
      marketAvgStarRating = Number(myHotel.star_rating);
    }

    const priceDiffPercent =
      marketAvgPrice > 0
        ? Number((((Number(myHotel.base_price_per_night) - marketAvgPrice) / marketAvgPrice) * 100).toFixed(1))
        : 0;

    const ratingDiff = Number((myAvgRating - marketAvgRating).toFixed(1));

    let recommendation = '';
    if (priceDiffPercent < -5) {
      recommendation = `Your rates are ${Math.abs(priceDiffPercent)}% lower than city average (€${marketAvgPrice}). Consider raising prices during high demand periods.`;
    } else if (priceDiffPercent > 10) {
      recommendation = `Your rates are ${priceDiffPercent}% above city average (€${marketAvgPrice}). Ensure luxury amenities and guest satisfaction justify premium pricing.`;
    } else {
      recommendation = `Your rates are well-aligned with the city market average (€${marketAvgPrice}). Monitor seasonal trends for dynamic adjustments.`;
    }

    res.status(200).json({
      success: true,
      data: {
        myHotel: {
          id: myHotel.id,
          name: myHotel.name,
          base_price_per_night: Number(myHotel.base_price_per_night),
          star_rating: Number(myHotel.star_rating),
          avg_rating: myAvgRating,
          review_count: myHotel.reviews ? myHotel.reviews.length : 0,
        },
        marketAverage: {
          city_name: myHotel.city ? myHotel.city.name : 'Your City',
          total_competitors: totalCompetitors,
          avg_base_price: marketAvgPrice,
          avg_star_rating: marketAvgStarRating,
          avg_guest_rating: marketAvgRating,
        },
        comparison: {
          price_difference_percentage: priceDiffPercent,
          rating_difference: ratingDiff,
          recommendation,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
