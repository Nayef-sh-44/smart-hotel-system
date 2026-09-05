const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

code = code.replace(/import TripCostCalculator from '\.\/pages\/TripCostCalculator\.jsx';/, "import TripPlan from './pages/TripPlan.jsx';");
code = code.replace(/<Route path="\/trip-cost" element=\{/, '<Route path="/trip-plan" element={');
code = code.replace(/<TripCostCalculator \/>/, '<TripPlan />');

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('PATCHED APP');
