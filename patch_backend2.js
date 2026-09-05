const fs = require('fs');
const file = 'backend/src/controllers/hotelController.js';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/fetchRes = await fetch\(ep, \{[\s\S]*?timeout: 10000\s*\}\);/, `
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        fetchRes = await fetch(ep, {
          method: 'POST',
          headers: {
            'User-Agent': 'SmartHotel-Backend/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: "data=" + encodeURIComponent(overpassQuery),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
`);

fs.writeFileSync(file, code);
console.log("PATCHED ABORT");
