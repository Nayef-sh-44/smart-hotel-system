const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

code = code.replace(/navigate\('\/trip-cost'\);/g, "navigate('/trip-plan');");

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('PATCHED HOTEL DETAIL ROUTING');
