const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

code = code.replace(/className="input-field text-xs text-center flex-1 m-0"\s*required\s*readOnly/, 'className="input-field text-xs text-center flex-1 m-0"\n                          required');

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
