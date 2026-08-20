import {
  User,
  Hotel,
  Booking,
  City,
  Review,
  sequelize,
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const disabledHotels = new Set();

export const getAnalytics = async (req, res, next) => {
  try {
    const allHotels = await Hotel.findAll();
    const totalHotels = allHotels.length;
    let activeHotels = 0;
    let disabledHotelsCount = 0;

    allHotels.forEach((h) => {
      if (disabledHotels.has(h.id)) {
        disabledHotelsCount++;
      } else {
        activeHotels++;
      }
    });

    const totalBookings = await Booking.count();

    res.status(200).json({
      success: true,
      data: {
        totalHotels,
        activeHotels,
        disabledHotels: disabledHotelsCount,
        totalBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Users management (retained for test suite compatibility)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, hotel_id } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', status: 404 } });
    }

    await user.update({
      role: role || user.role,
      hotel_id: hotel_id !== undefined ? (hotel_id ? Number(hotel_id) : null) : user.hotel_id,
      updated_at: new Date(),
    });

    res.status(200).json({ success: true, data: user, message: 'User role updated.' });
  } catch (error) {
    next(error);
  }
};

// Admin - All Hotels with City and unified Login Account email
export const getAllHotels = async (req, res, next) => {
  try {
    const [hotels, managers] = await Promise.all([
      Hotel.findAll({
        include: [
          { model: City, as: 'city', attributes: ['id', 'name', 'country'] }
        ],
        order: [['name', 'ASC']],
      }),
      User.findAll({
        where: {
          role: ['manager', 'hotel_manager']
        },
        attributes: ['id', 'email', 'full_name', 'hotel_id']
      })
    ]);

    const mapped = hotels.map(h => {
      const json = h.toJSON();
      const account = managers.find(m => m.hotel_id === h.id);
      json.email = account ? account.email : 'N/A';
      json.account_id = account ? account.id : null;
      json.is_active = !disabledHotels.has(h.id);
      return json;
    });

    res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    next(error);
  }
};

// Admin - Create Hotel Account (Creates BOTH Hotel record and Login Account as ONE object)
export const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      city_id,
      address,
      latitude,
      longitude,
      star_rating,
      base_price_per_night,
      phone_number
    } = req.body;

    if (!name || !email || !password || !city_id || !address) {
      return res.status(400).json({
        success: false,
        error: { message: 'name, email, password, city_id, and address are required', status: 400 },
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email already exists for a login account', status: 409 },
      });
    }

    const hotelPayload = {
      name,
      city_id: Number(city_id),
      address,
      latitude: latitude || 48.8566,
      longitude: longitude || 2.3522,
      star_rating: star_rating || 4.5,
      base_price_per_night: base_price_per_night || 150.00,
      check_in_time: '15:00:00',
      check_out_time: '11:00:00',
    };
    const newHotel = await Hotel.create(hotelPayload);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newAccount = await User.create({
      full_name: name,
      email,
      password_hash,
      phone_number: phone_number || null,
      role: 'hotel_manager',
      hotel_id: newHotel.id,
      preferred_currency: 'USD',
    });

    const json = newHotel.toJSON();
    json.email = newAccount.email;
    json.account_id = newAccount.id;
    json.is_active = true;

    res.status(201).json({ success: true, data: json, message: 'Hotel account created successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin - Edit Hotel Account (Updates BOTH Hotel record and Login Account email/name)
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found', status: 404 } });
    }

    await hotel.update({
      name: name || hotel.name,
      address: address || hotel.address,
      updated_at: new Date()
    });

    const account = await User.findOne({ where: { hotel_id: Number(id) } });
    if (account) {
      await account.update({
        full_name: name || account.full_name,
        email: email || account.email,
        updated_at: new Date()
      });
    }

    const json = hotel.toJSON();
    json.email = account ? account.email : (email || 'N/A');
    json.account_id = account ? account.id : null;
    json.is_active = !disabledHotels.has(hotel.id);

    res.status(200).json({ success: true, data: json, message: 'Hotel account updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin - Reset Hotel Account Password
export const resetHotelPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'new_password must be at least 6 characters long', status: 400 },
      });
    }

    const account = await User.findOne({ where: { hotel_id: Number(id) } });
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { message: 'Login account for this hotel not found', status: 404 },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await account.update({ password_hash, updated_at: new Date() });

    res.status(200).json({ success: true, message: 'Hotel password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin - Toggle Hotel Status (Active / Disabled)
export const toggleHotelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    if (disabledHotels.has(numId)) {
      disabledHotels.delete(numId);
    } else {
      disabledHotels.add(numId);
    }
    const is_active = !disabledHotels.has(numId);
    res.status(200).json({
      success: true,
      data: { id: numId, is_active },
      message: `Hotel status changed to ${is_active ? 'Active' : 'Disabled'}`
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Hotel.destroy({ where: { id: Number(id) } });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found', status: 404 } });
    }
    res.status(200).json({ success: true, message: 'Hotel deleted.' });
  } catch (error) {
    next(error);
  }
};

// Cities management
export const createCity = async (req, res, next) => {
  try {
    const cityPayload = {
      latitude: 48.8566,
      longitude: 2.3522,
      avg_daily_food_cost: 45.00,
      avg_daily_transport_cost: 15.00,
      ...req.body,
    };
    const newCity = await City.create(cityPayload);
    res.status(201).json({ success: true, data: newCity, message: 'City created.' });
  } catch (error) {
    next(error);
  }
};

// Review Moderation
export const getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { is_approved: false },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: Hotel, as: 'hotel', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'ASC']],
    });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, error: { message: 'Review not found', status: 404 } });
    }
    await review.update({ is_approved: true });
    res.status(200).json({ success: true, data: review, message: 'Review approved.' });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Review.destroy({ where: { id: Number(id) } });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: { message: 'Review not found', status: 404 } });
    }
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
