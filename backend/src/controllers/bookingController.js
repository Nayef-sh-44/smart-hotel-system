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
import { Op } from 'sequelize';

const createBookingSchema = z.object({
  hotel_id: z.number().int(),
  room_id: z.number().int(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  num_guests: z.number().int().min(1),
  special_requests: z.string().optional().nullable(),
  num_rooms: z.number().int().min(1).max(2).optional().default(1),
  voucher_code: z.string().optional().nullable(),
  reward_id: z.number().int().optional().nullable(),
    instance_id: z.number().int().optional().nullable(),
});

const updateBookingSchema = z.object({
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD required'),
  num_guests: z.number().int().min(1),
  room_id: z.number().int(),
});

const calculateDynamicPrice = (checkInStr, checkOutStr, baseRoomPrice, pricingRules, numRooms = 1, country = '') => {
  let calculatedBasePrice = 0;
  const checkInDate = new Date(checkInStr);
  const checkOutDate = new Date(checkOutStr);
  let currentDate = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()));
  const endDate = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate()));

  const getSeason = (date, countryName) => {
    const month = date.getUTCMonth() + 1;
    const southernHemisphereCountries = ['Australia', 'Brazil', 'South Africa', 'Argentina', 'New Zealand', 'Chile', 'Peru', 'Uruguay', 'Fiji', 'Papua New Guinea'];
    const isSouthern = southernHemisphereCountries.includes(countryName);

    if (month >= 6 && month <= 8) return isSouthern ? 'Winter' : 'Summer';
    if (month === 12 || month <= 2) return isSouthern ? 'Summer' : 'Winter';
    if (month >= 3 && month <= 5) return isSouthern ? 'Autumn' : 'Spring';
    return isSouthern ? 'Spring' : 'Autumn';
  };

  const getDayType = (date) => {
    const day = date.getUTCDay();
    // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
    if (day === 4 || day === 5 || day === 6 || day === 0) return 'Peak';
    return 'Normal';
  };

  while (currentDate < endDate) {
    const season = getSeason(currentDate, country);
    const dayType = getDayType(currentDate);
    let dailyMultiplier = 1.0;

    pricingRules.forEach((r) => {
      if (r.rule_type === 'season' && r.rule_target === season) {
        dailyMultiplier *= Number(r.multiplier);
      } else if (r.rule_type === 'day_type' && r.rule_target === dayType) {
        dailyMultiplier *= Number(r.multiplier);
      }
    });

    calculatedBasePrice += (baseRoomPrice * dailyMultiplier * numRooms);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return Number(calculatedBasePrice.toFixed(2));
};

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

    const room = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [{ model: City, as: 'city' }]
        }
      ],
      transaction
    });
    if (!room || room.hotel_id !== validated.hotel_id) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Room not found in specified hotel', status: 404 },
      });
    }

    const numRooms = validated.num_rooms || 1;

    if (room.available_rooms < numRooms || !room.is_available || room.status === 'unavailable') {
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

    // Dynamic pricing logic (Date-based)
    const pricingRules = await DynamicPricingRule.findAll({
      where: {
        hotel_id: validated.hotel_id,
        is_active: true,
      },
      transaction,
    });

    const baseRoomPrice = Number(room.price_per_night);
    let total_price = calculateDynamicPrice(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country
    );

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

      // 2. Loyalty Reward Discount
      let pendingReward = null;
      let userLoyalty = null;
      let appliedInstance = null;

      if (validated.instance_id) {
        appliedInstance = await UserRewardInstance.findOne({
          where: {
            id: validated.instance_id,
            user_id: req.user.id,
            hotel_id: validated.hotel_id,
            is_redeemed: false,
          },
          include: [{ model: LoyaltyReward, as: 'reward' }],
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!appliedInstance) {
          throw { name: 'ZodError', errors: [{ path: ['instance_id'], message: 'Voucher not found, already redeemed, or belongs to another hotel.' }] };
        }
        pendingReward = appliedInstance.reward;
      } else if (validated.reward_id) {
        pendingReward = await LoyaltyReward.findOne({
          where: { 
            id: validated.reward_id,
            hotel_id: validated.hotel_id,
            is_active: true
          },
          transaction,
        });

        if (!pendingReward) {
          throw { name: 'ZodError', errors: [{ path: ['reward_id'], message: 'Reward not found, inactive, or belongs to another hotel.' }] };
        }

        userLoyalty = await UserLoyalty.findOne({
          where: { user_id: req.user.id, hotel_id: validated.hotel_id },
          transaction,
        });

        if (!userLoyalty || userLoyalty.current_points < pendingReward.points_cost) {
          throw { name: 'ZodError', errors: [{ path: ['reward_id'], message: 'Insufficient loyalty points in this hotel to redeem this reward.' }] };
        }
      }

      if (pendingReward) {
        const priceAfterPromo = Math.max(0, total_price - promoDiscount);

        if (pendingReward.reward_type === 'percentage_discount') {
          const percent = Number(pendingReward.reward_value);
          loyaltyDiscount = Number((priceAfterPromo * (percent / 100)).toFixed(2));
          appliedVoucherText += ` [Loyalty Reward: ${percent}% OFF - €${loyaltyDiscount} off]`;
        } else {
          const fixed = Number(pendingReward.reward_value);
          loyaltyDiscount = Math.min(priceAfterPromo, fixed);
          appliedVoucherText += ` [Loyalty Reward: €${fixed} OFF - €${loyaltyDiscount} off]`;
        }
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
      currency: 'USD',
      status: 'confirmed',
      payment_status: 'paid',
      special_requests: finalSpecialRequests.trim(),
    }, { transaction });



    if (pendingReward) {
      if (appliedInstance) {
        await appliedInstance.update({
          is_redeemed: true,
          booking_reference: booking_reference,
          redeemed_at: new Date(),
        }, { transaction });
      } else if (userLoyalty) {
        // Deduct points
        const newPoints = userLoyalty.current_points - pendingReward.points_cost;
        await userLoyalty.update({
          current_points: newPoints,
          updated_at: new Date(),
        }, { transaction });
        
        // Create LoyaltyTransaction
        await LoyaltyTransaction.create({
          user_id: req.user.id,
          hotel_id: validated.hotel_id,
          booking_id: newBooking.id,
          transaction_type: 'redeemed',
          points: -pendingReward.points_cost,
          description: `Redeemed reward: ${pendingReward.reward_name} for booking ${booking_reference}`,
        }, { transaction });
        
        // Create UserRewardInstance for history
        await UserRewardInstance.create({
          user_id: req.user.id,
          reward_id: pendingReward.id,
          hotel_id: validated.hotel_id,
          booking_reference: booking_reference,
          is_redeemed: true,
          redeemed_at: new Date(),
        }, { transaction });
      }
    }

    // Award Loyalty Points Immediately
    const pointsEarned = Math.floor(Number(total_price) / 1000) * 100;

    if (pointsEarned > 0) {
      const existingTx = await LoyaltyTransaction.findOne({
        where: {
          user_id: req.user.id,
          hotel_id: validated.hotel_id,
          booking_id: newBooking.id,
          transaction_type: 'earned'
        },
        transaction
      });

      if (!existingTx) {
        let loyalty = await UserLoyalty.findOne({
          where: { user_id: req.user.id, hotel_id: validated.hotel_id },
          transaction
        });

        if (!loyalty) {
          loyalty = await UserLoyalty.create({
            user_id: req.user.id,
            hotel_id: validated.hotel_id,
            current_points: pointsEarned,
            lifetime_points: pointsEarned,
            level_id: 1,
          }, { transaction });
        } else {
          await loyalty.update({
            current_points: loyalty.current_points + pointsEarned,
            lifetime_points: loyalty.lifetime_points + pointsEarned,
            updated_at: new Date(),
          }, { transaction });
        }

        await LoyaltyTransaction.create({
          user_id: req.user.id,
          hotel_id: validated.hotel_id,
          booking_id: newBooking.id,
          transaction_type: 'earned',
          points: pointsEarned,
          description: `Points earned from booking ${booking_reference}`,
        }, { transaction });
      }
    }

    await transaction.commit();

    // Attach loyalty_points_earned to the response data
    const bookingData = newBooking.toJSON();
    bookingData.loyalty_points_earned = pointsEarned || 0;

    res.status(201).json({
      success: true,
      data: bookingData,
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

    let newRoom = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [{ model: City, as: 'city' }]
        }
      ],
      transaction
    });
    if (!newRoom || newRoom.hotel_id !== booking.hotel_id) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Room not found in this hotel', status: 404 } });
    }

    if (validated.num_guests > newRoom.capacity) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: `Room capacity exceeded. Max capacity is ${newRoom.capacity}`, status: 400 } });
    }

    if (isRoomChanged) {
      if (!newRoom.is_available || newRoom.available_rooms < 1 || newRoom.status === 'unavailable') {
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

      let newBasePrice = calculateDynamicPrice(
        validated.check_in_date,
        validated.check_out_date,
        Number(newRoom.price_per_night),
        pricingRules,
        booking.num_rooms || 1,
        newRoom.hotel?.city?.country
      );
      
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
      currency: 'USD',
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

