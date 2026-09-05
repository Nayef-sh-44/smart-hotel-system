const fs = require('fs');
const file = 'backend/src/controllers/hotelController.js';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/const timeoutId = setTimeout\(\(\) => controller\.abort\(\), 8000\);/g, `const timeoutId = setTimeout(() => controller.abort(), 2000);`);

fs.writeFileSync(file, code);
console.log("PATCHED TIMEOUT");
