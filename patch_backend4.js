const fs = require('fs');
const file = 'backend/src/controllers/hotelController.js';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/export const getNearbyServices = async \(req, res\) => {/, `export const getNearbyServices = async (req, res) => {
  console.log(">>>>>>>> NEARBY ENDPOINT HIT", req.url);
`);

fs.writeFileSync(file, code);
console.log("PATCHED LOG");
