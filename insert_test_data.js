import sequelize from './backend/src/config/database.js';
import { FlashDeal, DynamicPricingRule } from './backend/src/models/index.js';

async function run() {
  await sequelize.sync();
  
  // Clear old flash deals and rules
  await FlashDeal.destroy({ where: {} });
  await DynamicPricingRule.destroy({ where: {} });

  const now = new Date();
  const pastStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
  const pastEnd = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1); // 1 day ago

  const currentStart = new Date(now.getTime() - 1000 * 60 * 60 * 1); // 1 hour ago
  const currentEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1); // tomorrow

  const futureStart = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1); // tomorrow
  const futureEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2); // 2 days later

  // Insert Flash Deals
  await FlashDeal.create({ hotel_id: 1, title: 'Past Deal', discount_percentage: 10, discount_type: 'percentage', priority: 1, start_datetime: pastStart, end_datetime: pastEnd, remaining_rooms: 10, active_status: true });
  await FlashDeal.create({ hotel_id: 1, title: 'Current Deal', discount_percentage: 20, discount_type: 'percentage', priority: 1, start_datetime: currentStart, end_datetime: currentEnd, remaining_rooms: 10, active_status: true });
  await FlashDeal.create({ hotel_id: 2, title: 'Future Deal', discount_percentage: 30, discount_type: 'percentage', priority: 1, start_datetime: futureStart, end_datetime: futureEnd, remaining_rooms: 10, active_status: true });

  // Insert Pricing Rules
  await DynamicPricingRule.create({ rule_name: 'Weekend Peak', rule_type: 'day_type', rule_target: 'Peak', multiplier: 1.5, is_active: true });
  await DynamicPricingRule.create({ rule_name: 'Summer Season', rule_type: 'season', rule_target: 'Summer', multiplier: 1.2, is_active: true });

  console.log('Test data inserted');
  process.exit(0);
}
run();
