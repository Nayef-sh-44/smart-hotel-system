import {
  UserLoyalty,
  LoyaltyLevel,
  LoyaltyTransaction,
  LoyaltyReward,
  UserRewardInstance,
  Booking,
  LoyaltyConfig,
  sequelize,
} from '../models/index.js';
import { Op } from 'sequelize';

export const getMyLoyalty = async (req, res, next) => {
  try {
    let loyalty = await UserLoyalty.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: LoyaltyLevel,
          as: 'level',
        },
      ],
    });

    if (!loyalty) {
      loyalty = await UserLoyalty.create({
        user_id: req.user.id,
        current_points: 0,
        lifetime_points: 0,
        level_id: 1,
      });
    }

    // Sync missing points from past eligible bookings
    const todayStr = new Date().toISOString().split('T')[0];
    const eligibleBookings = await Booking.findAll({
      where: {
        user_id: req.user.id,
        status: { [Op.ne]: 'cancelled' },
        [Op.or]: [
          { status: 'completed' },
          { check_out_date: { [Op.lte]: todayStr } }
        ]
      },
    });
    console.log("ALL NON-CANCELLED BOOKINGS:", eligibleBookings.map(b => ({ id: b.id, check_out_date: b.check_out_date, status: b.status, lte: b.check_out_date <= todayStr })));
    console.log("ELIGIBLE BOOKINGS:", eligibleBookings.length, eligibleBookings.map(b => b.id));

    for (const booking of eligibleBookings) {
      const descriptionStr = `Points earned from booking ${booking.booking_reference}`;
      const existingTx = await LoyaltyTransaction.findOne({
        where: {
          user_id: req.user.id,
          transaction_type: 'earned',
          description: descriptionStr,
        },
      });

      if (!existingTx) {
        const config = await LoyaltyConfig.findOne();
        const pointsPerCurrency = config ? Number(config.points_per_currency) : 10;
        const pointsEarned = Math.round(Number(booking.total_price) * pointsPerCurrency);

        if (pointsEarned > 0) {
          await loyalty.update({
            current_points: loyalty.current_points + pointsEarned,
            lifetime_points: loyalty.lifetime_points + pointsEarned,
            updated_at: new Date(),
          });

          await LoyaltyTransaction.create({
            user_id: req.user.id,
            transaction_type: 'earned',
            points: pointsEarned,
            description: descriptionStr,
          });
        }
      }
    }

    const transactions = await LoyaltyTransaction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    const rewards = await LoyaltyReward.findAll({
      where: { is_active: true },
      order: [['points_cost', 'ASC']],
    });

    const rewardInstances = await UserRewardInstance.findAll({
      where: { user_id: req.user.id },
      include: [{ model: LoyaltyReward, as: 'reward' }],
      order: [['created_at', 'DESC']],
    });

    const mappedRewards = rewards.map((r) => {
      const json = r.toJSON();
      return {
        ...json,
        title: json.reward_name,
        description: `Redeem ${json.reward_name} (${json.reward_type}: €${json.reward_value} discount) for your next luxury booking.`,
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
    const { reward_id } = req.body;
    if (!reward_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'reward_id is required', status: 400 },
      });
    }

    const reward = await LoyaltyReward.findByPk(reward_id, { transaction });
    if (!reward || !reward.is_active) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Reward not found or inactive', status: 404 },
      });
    }

    const userLoyalty = await UserLoyalty.findOne({
      where: { user_id: req.user.id },
      transaction,
    });

    if (!userLoyalty || userLoyalty.current_points < reward.points_cost) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient loyalty points to redeem this reward.', status: 400 },
      });
    }

    // Deduct points
    const newPoints = userLoyalty.current_points - reward.points_cost;
    await userLoyalty.update({
      current_points: newPoints,
      updated_at: new Date(),
    }, { transaction });

    // Record transaction
    await LoyaltyTransaction.create({
      user_id: req.user.id,
      transaction_type: 'redeemed',
      points: -reward.points_cost,
      description: `Redeemed reward: ${reward.reward_name}`,
    }, { transaction });

    // Create user reward instance
    const instance = await UserRewardInstance.create({
      user_id: req.user.id,
      reward_id: reward.id,
      is_redeemed: false,
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: instance,
      message: 'Reward redeemed successfully.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
