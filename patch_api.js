const fs = require('fs');
const file = 'frontend/src/services/api.js';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/getNearbyServices: \(id\) => api.get\(\`\/hotels\/\$\{id\}\/nearby-services\`\),/, "getNearbyServices: (id) => api.get(`/hotels/${id}/nearby-services`),\n  getPricePreview: (id, params) => api.get(`/hotels/${id}/price-preview`, { params }),");

fs.writeFileSync(file, code);
console.log("PATCHED API");
