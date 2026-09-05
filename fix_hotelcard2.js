const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/HotelCard.jsx', 'utf8');

// The active deal style currently has 'animate-pulse'
// 'bg-rose-600 text-white border-rose-500 animate-pulse'

code = code.replace(
  "'bg-rose-600 text-white border-rose-500 animate-pulse'",
  "'bg-rose-600 text-white border-rose-500'"
);

fs.writeFileSync('frontend/src/components/HotelCard.jsx', code);
console.log('SUCCESS');
