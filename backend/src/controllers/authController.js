import bcrypt from 'bcryptjs';
import {
  sequelize,
  User,
  UserLoyalty,
  LoyaltyLevel,
  Favorite,
  SavedComparison,
  Review,
  LoyaltyTransaction,
  UserRewardInstance,
  Booking,
} from '../models/index.js';
import { generateToken } from '../utils/jwtHelper.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/authValidators.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'An account with this email already exists.', status: 409 },
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const newUser = await User.create({
      full_name: validatedData.full_name,
      email: validatedData.email,
      password_hash,
      phone_number: validatedData.phone_number || null,
      preferred_currency: validatedData.preferred_currency || 'EUR',
      role: validatedData.role || 'user',
      hotel_id: validatedData.hotel_id || null,
    });

    // If customer, initialize user loyalty record to Bronze level (1) if it doesn't exist
    if (newUser.role === 'customer' || newUser.role === 'user') {

      try {
        const defaultLevel = await LoyaltyLevel.findOne({
          order: [['min_points', 'ASC']],
        });
        if (defaultLevel) {
          await UserLoyalty.create({
            user_id: newUser.id,
            level_id: defaultLevel.id,
            current_points: 0,
            lifetime_points: 0,
          });
        }
      } catch (loyaltyErr) {
        console.warn('Could not initialize loyalty record for new customer:', loyaltyErr.message);
      }
    }

    const token = generateToken(newUser);

    const userResponse = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone_number: newUser.phone_number,
      role: newUser.role,
      preferred_currency: newUser.preferred_currency,
      hotel_id: newUser.hotel_id,
      created_at: newUser.created_at,
    };

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: 'User registered successfully.',
    });
  } catch (error) {
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

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.', status: 401 },
      });
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.', status: 401 },
      });
    }

    const token = generateToken(user);

    const userResponse = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      preferred_currency: user.preferred_currency,
      hotel_id: user.hotel_id,
      created_at: user.created_at,
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: 'Logged in successfully.',
    });
  } catch (error) {
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

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: UserLoyalty,
          as: 'loyalty',
          include: [{ model: LoyaltyLevel, as: 'level' }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 },
      });
    }

    await user.update({
      full_name: validatedData.full_name || user.full_name,
      phone_number: validatedData.phone_number !== undefined ? validatedData.phone_number : user.phone_number,
      preferred_currency: validatedData.preferred_currency || user.preferred_currency,
      updated_at: new Date(),
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
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

export const changePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 },
      });
    }

    const isCurrentValid = await bcrypt.compare(validatedData.current_password, user.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect.', status: 400 },
      });
    }

    const newPasswordHash = await bcrypt.hash(validatedData.new_password, 10);
    await user.update({
      password_hash: newPasswordHash,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
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

export const deleteAccount = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.user.id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 },
      });
    }

    await Favorite.destroy({ where: { user_id: user.id }, transaction });
    await SavedComparison.destroy({ where: { user_id: user.id }, transaction });
    await Review.destroy({ where: { user_id: user.id }, transaction });
    await LoyaltyTransaction.destroy({ where: { user_id: user.id }, transaction });
    await UserRewardInstance.destroy({ where: { user_id: user.id }, transaction });
    await UserLoyalty.destroy({ where: { user_id: user.id }, transaction });
    await Booking.destroy({ where: { user_id: user.id }, transaction });

    await user.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};
