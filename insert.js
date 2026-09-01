import { sequelize } from './src/models/index.js';
async function run() {
  await sequelize.query("INSERT INTO loyalty_rewards (hotel_id, reward_name, reward_type, reward_value, points_cost, is_active, created_at) VALUES (1, '10% Off', 'percentage_discount', 10, 50, 1, GETDATE())");
  console.log('Reward inserted!');
  process.exit(0);
}
run();
