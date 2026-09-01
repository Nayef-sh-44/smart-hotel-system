import re

with open('backend/src/controllers/bookingController.js', 'r') as f:
    content = f.read()

# 1. Add instance_id to schema
content = re.sub(
    r'(reward_id:\s*z\.number\(\)\.int\(\)\.optional\(\)\.nullable\(\),)',
    r'\1\n    instance_id: z.number().int().optional().nullable(),',
    content
)

# 2. Update the pendingReward logic
old_logic = """      // 2. Loyalty Reward Discount
      let pendingReward = null;
      let userLoyalty = null;
      if (validated.reward_id) {"""

new_logic = """      // 2. Loyalty Reward Discount
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
      } else if (validated.reward_id) {"""

content = content.replace(old_logic, new_logic)


# 3. Update the deduction logic
old_deduction = """    if (pendingReward && userLoyalty) {
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
    }"""

new_deduction = """    if (pendingReward) {
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
    }"""

content = content.replace(old_deduction, new_deduction)

with open('backend/src/controllers/bookingController.js', 'w') as f:
    f.write(content)

