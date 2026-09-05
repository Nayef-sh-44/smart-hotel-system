const fs = require('fs');
let code = fs.readFileSync('backend/src/models/Booking.js', 'utf8');

if (!code.includes('pricing_breakdown_json')) {
  code = code.replace(`special_requests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },`, `special_requests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pricing_breakdown_json: {
    type: DataTypes.TEXT,
    allowNull: true,
  },`);
  fs.writeFileSync('backend/src/models/Booking.js', code);
}
console.log('patched');
