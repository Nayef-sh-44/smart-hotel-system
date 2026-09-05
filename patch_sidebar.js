const fs = require('fs');
const file = 'frontend/src/pages/HotelDetail.jsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/\.slice\(0, 100\)\s*\.map\(\(place\) => \(/, `.map((place) => (`);

fs.writeFileSync(file, code);
console.log("PATCHED SIDEBAR SLICE");
