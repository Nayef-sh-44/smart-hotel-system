import {
  UserLoyalty,
  LoyaltyLevel,
  LoyaltyTransaction,
  LoyaltyReward,
  UserRewardInstance,
  Booking,
  LoyaltyConfig,
  Hotel,
  sequelize,
} from '../models/index.js';
import { Op } from 'sequelize';

export const getMyBalances = async (req, res, next) => {
  try {
    const balances = await UserLoyalty.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: LoyaltyLevel, as: 'level' },
        { model: Hotel, as: 'hotel', attributes: ['id', 'name', 'city_id'] }
      ],
      order: [['current_points', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyForHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json({ success: false, error: { message: 'Hotel ID is required' } });
    }

    let loyalty = await UserLoyalty.findOne({
      where: { user_id: req.user.id, hotel_id: hotelId },
      include: [
        { model: LoyaltyLevel, as: 'level' },
      ],
    });

    if (!loyalty) {
      loyalty = await UserLoyalty.create({
        user_id: req.user.id,
        hotel_id: hotelId,
        current_points: 0,
        lifetime_points: 0,
        level_id: 1,
      });
    }



    const transactions = await LoyaltyTransaction.findAll({
      where: { user_id: req.user.id, hotel_id: hotelId },
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    const rewards = await LoyaltyReward.findAll({
      where: { hotel_id: hotelId, is_active: true },
      order: [['points_cost', 'ASC']],
    });

    const rewardInstances = await UserRewardInstance.findAll({
      where: { user_id: req.user.id, hotel_id: hotelId },
      include: [{ model: LoyaltyReward, as: 'reward' }],
      order: [['created_at', 'DESC']],
    });

    const mappedRewards = rewards.map((r) => {
      const json = r.toJSON();
      return {
        ...json,
        title: json.reward_name,
        description: `Redeem ${json.reward_name} (${json.reward_type}: $${json.reward_value} discount) for your next booking at this hotel.`,
      };
    });

    const mappedInstances = rewardInstances.map((inst) => {
      const json = inst.toJSON();
      const code = `VIP-${json.id}0-${json.reward_id}`;
      return {
        ...json,
        voucher_code: code,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        points: loyalty ? loyalty.current_points : 0,
        tier: loyalty?.level?.name || 'Silver',
        loyalty,
        transactions,
        rewards: mappedRewards,
        rewardInstances: mappedInstances,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const redeemReward = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { reward_id, hotel_id } = req.body;
    
    if (!reward_id || !hotel_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'reward_id and hotel_id are required', status: 400 },
      });
    }

    const reward = await LoyaltyReward.findByPk(reward_id, { transaction });
    if (!reward || !reward.is_active || reward.hotel_id !== parseInt(hotel_id)) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Reward not found, inactive, or belongs to another hotel', status: 404 },
      });
    }

    const userLoyalty = await UserLoyalty.findOne({
      where: { user_id: req.user.id, hotel_id: hotel_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!userLoyalty || userLoyalty.current_points < reward.points_cost) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient loyalty points in this hotel to redeem this reward.', status: 400 },
      });
    }

    // Deduct points safely
    const [updatedRows] = await UserLoyalty.update({
      current_points: sequelize.literal(`current_points - ${reward.points_cost}`),
      updated_at: new Date(),
    }, {
      where: {
        user_id: req.user.id,
        hotel_id: hotel_id,
        current_points: {
          [Op.gte]: reward.points_cost
        }
      },
      transaction,
    });

    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient loyalty points or concurrent transaction.', status: 400 },
      });
    }

    // Record transaction
    await LoyaltyTransaction.create({
      user_id: req.user.id,
      hotel_id: hotel_id,
      transaction_type: 'redeemed',
      points: -reward.points_cost,
      description: `Redeemed reward: ${reward.reward_name}`,
    }, { transaction });

    // Create user reward instance
    const instance = await UserRewardInstance.create({
      user_id: req.user.id,
      reward_id: reward.id,
      hotel_id: hotel_id,
      is_redeemed: false,
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: instance,
      message: 'Reward redeemed successfully for this hotel.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
