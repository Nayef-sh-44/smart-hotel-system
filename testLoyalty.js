import { Booking } from './backend/src/models/index.js';
async function test() {
  const b = await Booking.findAll();
  console.log(b.map(x => ({ id: x.id, user_id: x.user_id })));
  process.exit();
}
test();
