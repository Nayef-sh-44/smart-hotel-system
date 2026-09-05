const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf-8');
code = code.replace("{ name: 'Trip Cost', path: '/trip-plan', icon: Calculator },", "{ name: 'Trip Plan', path: '/trip-plan', icon: Calculator },");
fs.writeFileSync('frontend/src/components/Navbar.jsx', code);
console.log("Updated Navbar");
