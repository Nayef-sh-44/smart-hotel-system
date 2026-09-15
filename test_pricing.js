import { calculatePricing } from './backend/src/services/pricingService.js';

const checkIn = '2026-09-16';
const checkOut = '2026-10-15'; // 29 nights
const baseRoomPrice = 220;
const pricingRules = [];
const numRooms = 1;
const country = 'US';
const flashDeals = [
  {
    active_status: true,
    start_datetime: '2026-09-15T00:00:00.000Z',
    end_datetime: '2026-10-10T00:00:00.000Z',
    discount_type: 'percentage',
    discount_percentage: 20
  }
];

const result = calculatePricing(checkIn, checkOut, baseRoomPrice, pricingRules, numRooms, country, flashDeals);

let discountedNights = 0;
let normalNights = 0;

result.nightlyBreakdown.forEach(night => {
  if (night.final_price < night.base_price) {
    discountedNights++;
  } else {
    normalNights++;
  }
});

console.log("Discounted nights:", discountedNights);
console.log("Normal nights:", normalNights);
console.log("Base Price without deal:", 220 * 29);
console.log("Total Price with deal:", result.totalPrice);
console.log("Tax:", result.taxAmount);
console.log("Final Total:", result.finalTotal);
