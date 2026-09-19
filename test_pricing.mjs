import { Hotel, Room, DynamicPricingRule, FlashDeal } from './backend/src/models/index.js';
import { calculatePricing } from './backend/src/services/pricingService.js';

async function testPricing(hotelId, startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    
    const hotelObj = await Hotel.findByPk(hotelId, {
        include: [
            { model: Room, as: 'rooms' },
            { model: DynamicPricingRule, as: 'pricingRules' },
            { model: FlashDeal, as: 'flashDeals' }
        ]
    });
    
    let totalRoomAvgSum = 0;
    hotelObj.rooms.forEach(room => {
        try {
            const baseRoomPrice = Number(room.price_per_night);
            const pricingData = calculatePricing(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                baseRoomPrice,
                hotelObj.pricingRules || [],
                1,
                'CountryName', // country
                hotelObj.flashDeals || []
            );
            totalRoomAvgSum += (pricingData.totalPrice / periodDays);
        } catch(e) {
            console.error(e);
            totalRoomAvgSum += Number(room.price_per_night);
        }
    });
    
    const avgPrice = totalRoomAvgSum / hotelObj.rooms.length;
    console.log(`Period: ${startDateStr} to ${endDateStr} => Avg Price: $${avgPrice.toFixed(2)}`);
}

async function run() {
    await testPricing(1, '2026-06-01', '2026-06-30');
    await testPricing(1, '2026-09-01', '2026-09-30');
    await testPricing(1, '2026-12-01', '2026-12-31');
}

run().catch(console.error).finally(() => process.exit(0));
