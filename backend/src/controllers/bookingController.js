import { z } from 'zod';
import {
  Booking,
  Hotel,
  Room,
  City,
  UserLoyalty,
  LoyaltyTransaction,
  LoyaltyConfig,
  DynamicPricingRule,
  UserRewardInstance,
  LoyaltyReward,
  sequelize,
} from '../models/index.js';

const createBookingSchema = z.object({
  hotel_id: z.number().int(),
  room_id: z.number().int(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  num_guests: z.number().int().min(1),
  special_requests: z.string().optional().nullable(),
  num_rooms: z.number().int().min(1).max(2).optional().default(1),
  voucher_code: z.string().optional().nullable(),
});

const updateBookingSchema = z.object({
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  num_guests: z.number().int().min(1),
  room_id: z.number().int(),
});

export const createBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const validated = createBookingSchema.parse(req.body);

    const checkIn = new Date(validated.check_in_date);
    const checkOut = new Date(validated.check_out_date);

    if (checkOut <= checkIn) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Check-out date must be after check-in date', status: 400 },
      });
    }

    const total_nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const room = await Room.findByPk(validated.room_id, { transaction });
    if (!room || room.hotel_id !== validated.hotel_id) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Room not found in specified hotel', status: 404 },
      });
    }

    const numRooms = validated.num_rooms || 1;

    if (room.available_rooms < numRooms || !room.is_available) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: { message: `Not enough rooms available (requested ${numRooms}, available ${room.available_rooms})`, status: 409 },
      });
    }

    if (validated.num_guests > room.capacity * numRooms) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: `Room capacity exceeded. Max capacity for ${numRooms} room(s) is ${room.capacity * numRooms}`, status: 400 },
      });
    }

    // Dynamic pricing multiplier
    const pricingRules = await DynamicPricingRule.findAll({
      where: {
        hotel_id: validated.hotel_id,
        is_active: true,
      },
      transaction,
    });

    let priceMultiplier = 1.0;
    pricingRules.forEach((r) => {
      priceMultiplier *= Number(r.season_factor || 1.0);
      priceMultiplier *= Number(r.occupancy_factor || 1.0);
      priceMultiplier *= Number(r.event_factor || 1.0);
      priceMultiplier *= Number(r.weekend_factor || 1.0);
      priceMultiplier *= Number(r.manual_factor || 1.0);
    });

    const roomPrice = Number(room.price_per_night);
    let total_price = Number((roomPrice * total_nights * priceMultiplier * numRooms).toFixed(2));
      let promoDiscount = 0;
      let loyaltyDiscount = 0;
      let appliedVoucherText = '';

      // 1. Existing Promotional Discount
      if (validated.voucher_code) {
        const code = validated.voucher_code.trim().toUpperCase();
        if (code === 'WELCOME10') {
          promoDiscount = Number((total_price * 0.10).toFixed(2));
          appliedVoucherText += ` [Promo Applied: WELCOME10 - €${promoDiscount} off]`;
        } else if (code === 'SMART20') {
          promoDiscount = 20;
          appliedVoucherText += ` [Promo Applied: SMART20 - €${promoDiscount} off]`;
        } else if (code === 'SUMMER50') {
          promoDiscount = 50;
          appliedVoucherText += ` [Promo Applied: SUMMER50 - €${promoDiscount} off]`;
        }
      }

      // 2. Loyalty Reward Discount (Auto-detect)
      const pendingReward = await UserRewardInstance.findOne({
        where: { user_id: req.user.id, is_redeemed: false },
        include: [{ model: LoyaltyReward, as: 'reward' }],
        order: [['created_at', 'ASC']],
        transaction,
      });

      if (pendingReward && pendingReward.reward) {
        const priceAfterPromo = Math.max(0, total_price - promoDiscount);

        if (pendingReward.reward.reward_type === 'percentage_discount') {
          const percent = Number(pendingReward.reward.reward_value);
          loyaltyDiscount = Number((priceAfterPromo * (percent / 100)).toFixed(2));
          appliedVoucherText += ` [Loyalty Reward: ${percent}% OFF - €${loyaltyDiscount} off]`;
        } else {
          const fixed = Number(pendingReward.reward.reward_value);
          loyaltyDiscount = fixed;
          appliedVoucherText += ` [Loyalty Reward: €${fixed} OFF - €${loyaltyDiscount} off]`;
        }

        await pendingReward.update({
          is_redeemed: true,
          redeemed_at: new Date(),
          booking_reference: null,
        }, { transaction });
      }

      const totalDiscount = promoDiscount + loyaltyDiscount;

    let base_discounted_price = Math.max(0, Number((total_price - totalDiscount).toFixed(2)));
    let tax_amount = Number((base_discounted_price * 0.03).toFixed(2));
    total_price = Number((base_discounted_price + tax_amount).toFixed(2));

    // Decrement available room count
    const updatedAvailableRooms = room.available_rooms - numRooms;
    await room.update({
      available_rooms: updatedAvailableRooms,
      is_available: updatedAvailableRooms > 0,
    }, { transaction });

    // Generate reference
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const booking_reference = `SMB-${Date.now().toString().slice(-4)}${randomHex}`;

    let finalSpecialRequests = (validated.special_requests || '') + (numRooms > 1 ? ` [${numRooms} Rooms Booked]` : '') + appliedVoucherText;

    const newBooking = await Booking.create({
      booking_reference,
      user_id: req.user.id,
      hotel_id: validated.hotel_id,
      room_id: validated.room_id,
      check_in_date: validated.check_in_date,
      check_out_date: validated.check_out_date,
      total_nights,
      num_guests: validated.num_guests,
      total_price,
      tax_amount,
      status: 'confirmed',
      payment_status: 'paid',
      special_requests: finalSpecialRequests.trim(),
    }, { transaction });



    if (pendingReward) {
      await pendingReward.update({ booking_reference }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Booking confirmed successfully.',
    });
  } catch (error) {
    await transaction.rollback();
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          status: 400,
        },
      });
    }
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'address', 'primary_image_url', 'star_rating'],
          include: [{ model: City, as: 'city', attributes: ['id', 'name', 'country'] }],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'price_per_night', 'capacity'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [{ model: City, as: 'city' }],
        },
        {
          model: Room,
          as: 'room',
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found', status: 404 },
      });
    }

    if (
      req.user.role !== 'system_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'hotel_manager' &&
      req.user.role !== 'manager' &&
      booking.user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied to this booking', status: 403 },
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, { transaction });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found', status: 404 },
      });
    }

    if (
      req.user.role !== 'system_admin' &&
      req.user.role !== 'admin' &&
      booking.user_id !== req.user.id
    ) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: { message: 'You can only cancel your own bookings', status: 403 },
      });
    }

    if (booking.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Booking is already cancelled', status: 400 },
      });
    }

    await booking.update({
      status: 'cancelled',
      updated_at: new Date(),
    }, { transaction });

    // Restore room availability
    const room = await Room.findByPk(booking.room_id, { transaction });
    if (room) {
      await room.update({
        available_rooms: room.available_rooms + 1,
        is_available: true,
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const validated = updateBookingSchema.parse(req.body);

    const booking = await Booking.findByPk(id, { transaction });
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Booking not found', status: 404 } });
    }

    if (booking.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ success: false, error: { message: 'You can only edit your own bookings', status: 403 } });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: `Cannot edit a ${booking.status} booking`, status: 400 } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentCheckOut = new Date(booking.check_out_date);
    if (currentCheckOut < today) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: 'Cannot edit past bookings', status: 400 } });
    }

    const newCheckIn = new Date(validated.check_in_date);
    const newCheckOut = new Date(validated.check_out_date);

    if (newCheckOut <= newCheckIn) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: 'Check-out date must be after check-in date', status: 400 } });
    }
    if (newCheckIn < today) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: 'Check-in date cannot be in the past', status: 400 } });
    }

    const isDateChanged = booking.check_in_date !== validated.check_in_date || booking.check_out_date !== validated.check_out_date;
    const isRoomChanged = booking.room_id !== validated.room_id;

    if (isDateChanged || isRoomChanged) {
      const hasVoucher = booking.special_requests && (booking.special_requests.includes('Promo Applied:') || booking.special_requests.includes('Voucher Applied:'));
      if (hasVoucher) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: { message: 'This booking contains a promotional discount and cannot be repriced safely online. Please cancel and rebook, or contact support.', status: 400 } });
      }
    }

    let newRoom = await Room.findByPk(validated.room_id, { transaction });
    if (!newRoom || newRoom.hotel_id !== booking.hotel_id) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Room not found in this hotel', status: 404 } });
    }

    if (validated.num_guests > newRoom.capacity) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: `Room capacity exceeded. Max capacity is ${newRoom.capacity}`, status: 400 } });
    }

    if (isRoomChanged) {
      if (!newRoom.is_available || newRoom.available_rooms < 1) {
        await transaction.rollback();
        return res.status(409).json({ success: false, error: { message: 'The selected room type is currently unavailable', status: 409 } });
      }

      const oldRoom = await Room.findByPk(booking.room_id, { transaction });
      if (oldRoom) {
        await oldRoom.update({
          available_rooms: oldRoom.available_rooms + 1,
          is_available: true,
        }, { transaction });
      }

      await newRoom.update({
        available_rooms: newRoom.available_rooms - 1,
        is_available: (newRoom.available_rooms - 1) > 0,
      }, { transaction });
    }

    let newTotalPrice = booking.total_price;
    let newTaxAmount = booking.tax_amount;
    if (isDateChanged || isRoomChanged) {
      const total_nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
      
      const pricingRules = await DynamicPricingRule.findAll({
        where: { hotel_id: booking.hotel_id, is_active: true },
        transaction,
      });

      let priceMultiplier = 1.0;
      pricingRules.forEach((r) => {
        priceMultiplier *= Number(r.season_factor || 1.0);
        priceMultiplier *= Number(r.occupancy_factor || 1.0);
        priceMultiplier *= Number(r.event_factor || 1.0);
        priceMultiplier *= Number(r.weekend_factor || 1.0);
        priceMultiplier *= Number(r.manual_factor || 1.0);
      });

      let newBasePrice = Number((Number(newRoom.price_per_night) * total_nights * priceMultiplier).toFixed(2));
      newTaxAmount = Number((newBasePrice * 0.03).toFixed(2));
      newTotalPrice = Number((newBasePrice + newTaxAmount).toFixed(2));
    }

    await booking.update({
      check_in_date: validated.check_in_date,
      check_out_date: validated.check_out_date,
      num_guests: validated.num_guests,
      room_id: validated.room_id,
      total_nights: Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24)),
      total_price: newTotalPrice,
      tax_amount: newTaxAmount,
      updated_at: new Date(),
    }, { transaction });

    await transaction.commit();

    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: Hotel, as: 'hotel', include: [{ model: City, as: 'city' }] },
        { model: Room, as: 'room' },
      ],
    });

    res.status(200).json({ success: true, data: updatedBooking, message: 'Booking updated successfully.' });
  } catch (error) {
    await transaction.rollback();
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '), status: 400 } });
    }
    next(error);
  }
};

