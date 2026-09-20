import fs from 'fs';
let content = fs.readFileSync('frontend/src/pages/MyBookings.jsx', 'utf8');

content = content.replace(/\/\/\(\w\+\)\w\+Rooms\//g, '/\\[(\\d+)\\s+Rooms/');
content = content.replace(/match\(\/\[\(d\+\)s\+Rooms\/\)/g, 'match(/\\[(\\d+)\\s+Rooms/)');

fs.writeFileSync('frontend/src/pages/MyBookings.jsx', content, 'utf8');
console.log("Fixed regex in MyBookings.jsx");
