const fs = require('fs');
const file = 'frontend/src/pages/HotelDetail.jsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/Church\n\} from 'lucide-react';/, `Church,\n  Banknote\n} from 'lucide-react';`);

fs.writeFileSync(file, code);
console.log("PATCHED BANKNOTE");
