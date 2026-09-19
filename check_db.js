const { Sequelize } = require('sequelize');
const db = require('./backend/src/models/index.js');

async function checkDb() {
    const rules = await db.DynamicPricingRule.findAll();
    console.log('Dynamic Pricing Rules:', rules.length);
    if(rules.length > 0) {
        console.log(rules.map(r => r.toJSON()));
    }
    const deals = await db.FlashDeal.findAll();
    console.log('Flash Deals:', deals.length);
    if(deals.length > 0) {
        console.log(deals.map(r => r.toJSON()));
    }
    const bookings = await db.Booking.findAll({ where: { status: 'confirmed' }});
    console.log('Confirmed Bookings:', bookings.length);
    if(bookings.length > 0) {
        console.log(bookings.map(b => ({ in: b.check_in_date, out: b.check_out_date, hotel: b.hotel_id })).slice(0, 5));
    }
}
checkDb().catch(console.error);
