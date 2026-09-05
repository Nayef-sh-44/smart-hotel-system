import sequelize from './backend/src/config/database.js';
import { FlashDeal } from './backend/src/models/index.js';

async function run() {
  const deals = await FlashDeal.findAll();
  console.log('Total Flash Deals:', deals.length);
  process.exit(0);
}
run();
