const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'react') return require('E:/SmartHotelBooking_Node/frontend/node_modules/react');
  if (id === 'lucide-react') return require('E:/SmartHotelBooking_Node/frontend/node_modules/lucide-react');
  if (id.includes('services/api.js')) return { hotelService: { getAll: async () => ({}) } };
  if (id.includes('hooks/useCurrency.js')) return { useCurrency: () => ({ symbol: '$', convertFromUSD: (x)=>x, formatPrice: (x)=>x, currency: 'USD' }) };
  return originalRequire.apply(this, arguments);
};

const React = require('E:/SmartHotelBooking_Node/frontend/node_modules/react');
const ReactDOMServer = require('E:/SmartHotelBooking_Node/frontend/node_modules/react-dom/server');
const comp = require('./frontend/test_trip.cjs').default;

try {
  const html = ReactDOMServer.renderToString(React.createElement(comp));
  console.log('RENDER SUCCESS! HTML starts with:', html.substring(0, 100));
} catch(e) {
  console.log('RUNTIME ERROR:', e.message);
  console.log(e.stack);
}
