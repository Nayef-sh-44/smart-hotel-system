process.env.DOCKER_ENV = 'true';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '1434';

async function run() {
  const { default: sequelize } = await import('./backend/src/config/database.js');
  const { FlashDeal, DynamicPricingRule, Favorite, Room } = await import('./backend/src/models/index.js');
  
  await sequelize.sync();
  
  await FlashDeal.destroy({ where: {} });
  await DynamicPricingRule.destroy({ where: {} });
  await Favorite.destroy({ where: {} });

  const now = new Date();
  
  const pastStart = new Date(now.getTime() - 1000 * 60 * 60 * 48);
  const pastEnd = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  await FlashDeal.create({ hotel_id: 1, title: 'Expired Deal', discount_percentage: 10, discount_type: 'percentage', start_datetime: pastStart, end_datetime: pastEnd, remaining_rooms: 10, active_status: true });

  const currentStart = new Date(now.getTime() - 1000 * 60 * 60 * 1);
  const currentEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  await FlashDeal.create({ hotel_id: 2, title: 'Active Deal', discount_percentage: 20, discount_type: 'percentage', start_datetime: currentStart, end_datetime: currentEnd, remaining_rooms: 10, active_status: true });

  await DynamicPricingRule.create({ hotel_id: 2, rule_name: 'Peak Days', rule_type: 'day_type', rule_target: 'Peak', multiplier: 1.5, is_active: true });

  await Favorite.create({ user_id: 1, hotel_id: 1 });
  
  console.log('Inserted into Docker DB');
  process.exit(0);
}
run();
