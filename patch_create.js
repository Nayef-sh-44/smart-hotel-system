const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

const oldStr = `let total_price = calculateDynamicPrice(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country
    );`;

const newStr = `let { totalPrice: total_price, nightlyBreakdown, taxAmount, finalTotal } = calculatePricing(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country,
      room.hotel?.flashDeals || room.flashDeals || []
    );`;

code = code.replace(oldStr, newStr);

// Wait, the tax calculation in bookingController.js is different:
// It looks like:
// let base_discounted_price = Math.max(0, Number((total_price - totalDiscount).toFixed(2)));
// let tax_amount = Number((base_discounted_price * 0.03).toFixed(2));
// total_price = Number((base_discounted_price + tax_amount).toFixed(2));

fs.writeFileSync('backend/src/controllers/bookingController.js', code);
console.log('patched');
