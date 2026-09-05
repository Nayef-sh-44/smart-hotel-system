process.env.DOCKER_ENV = 'true';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '1434';

import sequelize from './backend/src/config/database.js';
import { FlashDeal, DynamicPricingRule, Favorite, Room } from './backend/src/models/index.js';
import http from 'http';

function req(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + path, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
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

  await DynamicPricingRule.create({ rule_name: 'Peak Days', rule_type: 'day_type', rule_target: 'Peak', multiplier: 1.5, is_active: true });

  await Favorite.create({ user_id: 1, hotel_id: 1 });
  
  console.log('--- TEST 1, 2, 3, 4: Pricing ---');
  
  const checkIn = new Date();
  while(checkIn.getUTCDay() !== 3) checkIn.setDate(checkIn.getDate() + 1);
  const inStr = checkIn.toISOString().split('T')[0];
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  const outStr = checkOut.toISOString().split('T')[0];

  const r1 = await Room.findOne({where: {hotel_id: 1}});
  const r2 = await Room.findOne({where: {hotel_id: 2}});

  const preview1 = await req(`/api/hotels/1/price-preview?room_id=${r1.id}&check_in_date=${inStr}&check_out_date=${outStr}&num_rooms=1`);
  console.log('Hotel 1 (Expired Deal) Preview:', JSON.stringify(preview1.data, null, 2));

  const preview2 = await req(`/api/hotels/2/price-preview?room_id=${r2.id}&check_in_date=${inStr}&check_out_date=${outStr}&num_rooms=1`);
  console.log('Hotel 2 (Active Deal + Dynamic) Preview:', JSON.stringify(preview2.data, null, 2));

  console.log('\n--- TEST 5 & 6: Recommendations ---');
  const anonRecs = await req('/api/recommendations?city_id=1&trip_type=family');
  console.log('Anonymous Top Recommendation:', anonRecs.data[0].hotel.name, anonRecs.data[0].recommendationScore);

  process.exit(0);
}
run();
