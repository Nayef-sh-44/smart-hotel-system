const fs = require('fs');

let code = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

// Import pricingService
code = code.replace(
  `import { z } from 'zod';`,
  `import { z } from 'zod';\nimport { calculatePricing } from '../services/pricingService.js';`
);

// Remove local calculateDynamicPrice
const match = code.match(/const calculateDynamicPrice = \([^]+?return \{ totalPrice: Number\(calculatedBasePrice\.toFixed\(2\)\), nightlyBreakdown \};\n\};\n/);
if (match) {
  code = code.replace(match[0], '');
}

// Fix createBooking
code = code.replace(
  `let total_price = calculateDynamicPrice(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country
    );`,
  `let { totalPrice: total_price, nightlyBreakdown, taxAmount, finalTotal } = calculatePricing(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country,
      room.hotel?.flashDeals || room.flashDeals || []
    );`
);

// Fix taxAmount calculation in createBooking
code = code.replace(
  `const tax_amount = Number(((total_price - promoDiscount - loyaltyDiscount) * 0.03).toFixed(2));
      const final_total = Number((total_price - promoDiscount - loyaltyDiscount + tax_amount).toFixed(2));`,
  `total_price = Number(Math.max(0, total_price - promoDiscount - loyaltyDiscount).toFixed(2));
      const tax_amount = Number((total_price * 0.03).toFixed(2));
      const final_total = Number((total_price + tax_amount).toFixed(2));`
);

// Fix updateBooking
code = code.replace(
  `let newBasePrice = calculateDynamicPrice(
          validated.check_in_date,
          validated.check_out_date,
          Number(newRoom.price_per_night),
          pricingRules,
          booking.num_rooms || 1,
          newRoom.hotel?.city?.country
        );
        
        newTaxAmount = Number((newBasePrice * 0.03).toFixed(2));
        newTotalPrice = Number((newBasePrice + newTaxAmount).toFixed(2));`,
  `let { totalPrice: newBasePrice, nightlyBreakdown: newBreakdown, taxAmount: newTaxAmount, finalTotal: newTotalPrice } = calculatePricing(
          validated.check_in_date,
          validated.check_out_date,
          Number(newRoom.price_per_night),
          pricingRules,
          booking.num_rooms || 1,
          newRoom.hotel?.city?.country,
          newRoom.hotel?.flashDeals || newRoom.flashDeals || []
        );`
);

fs.writeFileSync('backend/src/controllers/bookingController.js', code);
console.log('Patched bookingController');
