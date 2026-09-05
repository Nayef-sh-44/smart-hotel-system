const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// Replace the imports to include the icons we need
code = code.replace(
  "import {",
  "import { Banknote, Utensils, ShoppingBag, HeartPulse, Train, TreePine, Ticket, Church, Map as MapIcon, Loader2, Navigation, Compass, MapPin as MapLucide, "
);

// We need a helper for place icons
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

// Insert the helper right after the imports
const insertIndex = code.indexOf('export default function HotelDetail() {');
code = code.substring(0, insertIndex) + iconHelper + '\n' + code.substring(insertIndex);

// Update the list render to use PlaceIcon
const oldRender = `
                        <div className="flex items-start gap-2 overflow-hidden">
                          <div 
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                            style={{ backgroundColor: place.color }}
                          />
                          <div className="flex flex-col truncate">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate" title={place.name}>{place.name}</span>
                            <span className="text-slate-400 font-medium">{place.category}</span>
                          </div>
                        </div>
`;

const newRender = `
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <PlaceIcon category={place.category} color={place.color} className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate" title={place.name}>{place.category}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium truncate text-[11px]">{place.name}</span>
                          </div>
                        </div>
`;

code = code.replace(oldRender.trim(), newRender.trim());
fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS');
