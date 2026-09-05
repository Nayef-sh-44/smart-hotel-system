const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

const targetStr = `const { user, isAuthenticated } = useAuth();`;
const replaceStr = `const { user, isAuthenticated } = useAuth();\n  const { addDestination } = useTrip();`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log("Added useTrip hook call!");
