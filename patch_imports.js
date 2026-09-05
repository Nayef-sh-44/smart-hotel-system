const fs = require('fs');
const file = 'frontend/src/pages/HotelDetail.jsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/Map as MapLucide\s*\} from 'lucide-react';/, `Map as MapLucide,\n  Utensils,\n  Landmark,\n  ShoppingBag,\n  HeartPulse,\n  Train,\n  TreePine,\n  Ticket,\n  Church\n} from 'lucide-react';`);

fs.writeFileSync(file, code);
console.log("PATCHED IMPORTS");
