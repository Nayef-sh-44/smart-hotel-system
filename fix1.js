const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Add lucide imports
code = code.replace(
  "import {\n  Star,",
  "import {\n  Banknote, Utensils, ShoppingBag, HeartPulse, Train, TreePine, Ticket, Church,\n  Star,"
);

// 2. Add PlaceIcon component right before export default function
const iconHelper = `
const PlaceIcon = ({ category, className, color }) => {
  const props = { className, style: { color } };
  if (category === 'ATM') return <Banknote {...props} />;
  if (category === 'Restaurant') return <Utensils {...props} />;
  if (category === 'Shopping') return <ShoppingBag {...props} />;
  if (category === 'Healthcare') return <HeartPulse {...props} />;
  if (category === 'Transport') return <Train {...props} />;
  if (category === 'Family & Parks') return <TreePine {...props} />;
  if (category === 'Entertainment') return <Ticket {...props} />;
  if (category === 'Religious') return <Church {...props} />;
  return <MapLucide {...props} />;
};

`;
code = code.replace("export default function HotelDetail() {", iconHelper + "export default function HotelDetail() {");

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS 1');
