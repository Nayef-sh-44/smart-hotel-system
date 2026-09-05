const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

code = code.replace(`total_price,
      tax_amount,
      currency: 'USD',`, `total_price,
      tax_amount,
      pricing_breakdown_json: JSON.stringify(nightlyBreakdown),
      currency: 'USD',`);

code = code.replace(`total_price: newTotalPrice,
      tax_amount: newTaxAmount,
      currency: 'USD',`, `total_price: newTotalPrice,
      tax_amount: newTaxAmount,
      pricing_breakdown_json: JSON.stringify(newBreakdown),
      currency: 'USD',`);

fs.writeFileSync('backend/src/controllers/bookingController.js', code);
