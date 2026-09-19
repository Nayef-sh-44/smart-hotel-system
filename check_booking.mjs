import { Booking } from './backend/src/models/index.js';

async function run() {
    const b = await Booking.findOne({ where: { hotel_id: 1 } });
    console.log(b.toJSON());
}
run().catch(console.error).finally(() => process.exit(0));
