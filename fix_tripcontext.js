const fs = require('fs');
let code = fs.readFileSync('frontend/src/context/TripContext.jsx', 'utf-8');

const oldCode = `destinations: [...prev.destinations, { ...dest, id: Date.now().toString() }]`;
const newCode = `destinations: [...(prev?.destinations || []), { ...dest, id: Date.now().toString() }]`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('frontend/src/context/TripContext.jsx', code);
console.log("Updated TripContext.jsx");
