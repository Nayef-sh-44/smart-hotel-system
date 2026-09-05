const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { useComparison } from '../context/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Hotel, Trash2, Edit2, Plus, Download, Banknote } from 'lucide-react';
import { hotelService } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TripPlan() {
  const { tripPlan, removeDestination, updateTripDetails, clearTrip } = useTrip();
  const { currency: userCurrency, conversionRates } = useComparison();
  const navigate = useNavigate();
  const [pricingResults, setPricingResults] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const convertFromUSD = (usdAmount, targetCurrency) => {
    if (targetCurrency === 'USD') return usdAmount;
    if (!conversionRates || !conversionRates[targetCurrency]) return usdAmount;
    return usdAmount * conversionRates[targetCurrency];
  };

  const symbol = userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : userCurrency === 'SYP' ? 'SYP ' : userCurrency === 'AED' ? 'AED ' : '$';

  useEffect(() => {
    const fetchPricing = async () => {
      if (!tripPlan.destinations || tripPlan.destinations.length === 0) return;
      setIsCalculating(true);
      const results = {};
      for (const dest of tripPlan.destinations) {
        try {
          const res = await hotelService.getPricePreview(dest.hotelId, {
            room_id: dest.roomId,
            check_in_date: dest.checkIn,
            check_out_date: dest.checkOut,
            num_rooms: dest.rooms
          });
          if (res.success) {
            results[dest.id] = res.data;
          }
        } catch (err) {
          console.error("Error calculating price for dest", dest.id, err);
        }
      }
      setPricingResults(results);
      setIsCalculating(false);
    };

    fetchPricing();
  }, [tripPlan.destinations]);

  let grandTotalHotel = 0;
  let grandTotalTax = 0;
  let grandTotalFood = 0;
  let grandTotalTransport = 0;
  let totalTripNights = 0;
  let grandTotalDiscounts = 0;

  tripPlan.destinations.forEach(dest => {
    const pricing = pricingResults[dest.id];
    const checkInD = new Date(dest.checkIn);
    const checkOutD = new Date(dest.checkOut);
    const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));
    totalTripNights += nights;
    
    const avgFood = dest.city?.avg_daily_food_cost || 25;
    const avgTrans = dest.city?.avg_daily_transport_cost || 10;
    
    const tripDays = nights + 1;
    const foodCost = avgFood * dest.guests * tripDays;
    const transCost = avgTrans * dest.guests * tripDays;
    
    grandTotalFood += foodCost;
    grandTotalTransport += transCost;

    if (pricing) {
      grandTotalHotel += pricing.totalPrice;
      grandTotalTax += pricing.taxAmount;
      if (pricing.activeDeal) {
        grandTotalDiscounts += (pricing.totalPrice * pricing.activeDeal.discount_percentage / 100);
      }
    }
  });

  const handleDownloadPdf = () => {
    toast.success('Generating Professional PDF Report...');
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); 
    doc.text('SMART HOTEL PRO', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('TRIP REPORT', 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Trip Name: \${tripPlan.name || 'My Trip'}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Trip Type: \${tripPlan.tripType || 'Standard'}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Total Destinations: \${tripPlan.destinations.length}\`, 14, yPos);
    yPos += 7;
    doc.text(\`Total Nights: \${totalTripNights}\`, 14, yPos);
    yPos += 15;

    tripPlan.destinations.forEach((dest, index) => {
      const pricing = pricingResults[dest.id];
      const checkInD = new Date(dest.checkIn);
      const checkOutD = new Date(dest.checkOut);
      const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));
      const tripDays = nights + 1;
      
      const avgFood = dest.city?.avg_daily_food_cost || 25;
      const avgTrans = dest.city?.avg_daily_transport_cost || 10;
      const foodCost = avgFood * dest.guests * tripDays;
      const transCost = avgTrans * dest.guests * tripDays;

      let hotelCost = 0, taxCost = 0, finalHotelTotal = 0;
      if (pricing) {
        hotelCost = pricing.totalPrice;
        taxCost = pricing.taxAmount;
        finalHotelTotal = pricing.finalTotal;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text(\`DESTINATION \${index + 1}: \${dest.city?.name || dest.city || 'City'} - \${dest.hotelName}\`, 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(\`Room: \${dest.roomName}\`, 14, yPos);
      doc.text(\`Rooms: \${dest.rooms}\`, 100, yPos);
      yPos += 6;
      doc.text(\`Guests: \${dest.guests}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Check-in: \${dest.checkIn}\`, 14, yPos);
      doc.text(\`Check-out: \${dest.checkOut} (\${nights} Nights)\`, 100, yPos);
      yPos += 10;

      if (pricing && pricing.nightlyBreakdown) {
        const tableData = pricing.nightlyBreakdown.map(night => [
          night.date,
          night.dayType,
          symbol + convertFromUSD(night.base_price, userCurrency).toFixed(2),
          night.multiplier + 'x',
          symbol + convertFromUSD(night.final_price, userCurrency).toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Day Type', 'Base Rate', 'Dynamic', 'Final Rate']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 8 },
          margin: { left: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (pricing && pricing.activeDeal) {
        doc.setTextColor(16, 185, 129);
        doc.text(\`* Flash Deal Applied: \${pricing.activeDeal.discount_percentage}% OFF\`, 14, yPos);
        yPos += 8;
      }

      doc.setTextColor(0, 0, 0);
      doc.text(\`Base Price: \${symbol}\${convertFromUSD(hotelCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Taxes (3%): \${symbol}\${convertFromUSD(taxCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Food: \${symbol}\${convertFromUSD(foodCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Transport: \${symbol}\${convertFromUSD(transCost, userCurrency).toFixed(2)}\`, 14, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(\`Destination Total: \${symbol}\${convertFromUSD(finalHotelTotal + foodCost + transCost, userCurrency).toFixed(2)}\`, 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 15;
    });

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('FINAL TRIP COST', 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Accommodation: \${symbol}\${convertFromUSD(grandTotalHotel, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    if (grandTotalDiscounts > 0) {
        doc.text(\`Discounts: -\${symbol}\${convertFromUSD(grandTotalDiscounts, userCurrency).toFixed(2)}\`, 14, yPos);
        yPos += 8;
    }
    doc.text(\`Taxes: \${symbol}\${convertFromUSD(grandTotalTax, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    doc.text(\`Food: \${symbol}\${convertFromUSD(grandTotalFood, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 8;
    doc.text(\`Transport: \${symbol}\${convertFromUSD(grandTotalTransport, userCurrency).toFixed(2)}\`, 14, yPos);
    yPos += 12;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const grandTotal = grandTotalHotel + grandTotalTax + grandTotalFood + grandTotalTransport;
    doc.text(\`GRAND TOTAL: \${symbol}\${convertFromUSD(grandTotal, userCurrency).toFixed(2)}\`, 14, yPos);
    
    doc.save('SmartHotel_TripReport.pdf');
  };

  if (!tripPlan.destinations || tripPlan.destinations.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-24 min-h-screen">
        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <MapPin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Create Your Trip</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Your trip plan is empty. Set your trip details and start adding destinations to plan your perfect getaway.
          </p>

          <div className="max-w-md mx-auto space-y-4 mb-8 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Trip Name</label>
              <input 
                type="text" 
                value={tripPlan.name} 
                onChange={(e) => updateTripDetails({ name: e.target.value })}
                className="input-field w-full"
                placeholder="e.g. Family Vacation"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Trip Type</label>
              <select 
                value={tripPlan.tripType} 
                onChange={(e) => updateTripDetails({ tripType: e.target.value })}
                className="input-field w-full"
              >
                <option value="Family">Family</option>
                <option value="Couple">Couple</option>
                <option value="Solo">Solo</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <button onClick={() => navigate('/hotels')} className="btn-primary py-3 px-8 text-lg w-full max-w-md shadow-lg shadow-brand-500/30">
            Start Planning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-24 min-h-screen space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Trip Plan</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your entire trip, destinations, and costs.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={clearTrip} className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold transition-colors">
            <Trash2 className="w-4 h-4" /> Clear Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">TRIP INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trip Name</label>
                <input 
                  type="text" 
                  value={tripPlan.name} 
                  onChange={(e) => updateTripDetails({ name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trip Type</label>
                <select 
                  value={tripPlan.tripType} 
                  onChange={(e) => updateTripDetails({ tripType: e.target.value })}
                  className="input-field"
                >
                  <option value="Family">Family</option>
                  <option value="Couple">Couple</option>
                  <option value="Solo">Solo</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">DESTINATIONS</h2>
            
            <div className="space-y-6">
              {tripPlan.destinations.map((dest, index) => {
                const checkInD = new Date(dest.checkIn);
                const checkOutD = new Date(dest.checkOut);
                const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={dest.id} className="relative p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-brand-600 bg-brand-100 dark:bg-brand-900/30 px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                          Destination {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{dest.city?.name || dest.city || 'City'}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" title="Edit (remove and re-add for now)">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeDestination(dest.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="block text-xs text-slate-500">Hotel</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.hotelName}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Room</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.roomName}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Rooms</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.rooms}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Guests</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.guests}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Check-in</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.checkIn}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Check-out</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.checkOut}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500">Nights</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{nights}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button onClick={() => navigate('/hotels')} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-semibold hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Destination
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">TRIP COST</h2>
            
            {isCalculating ? (
              <div className="py-8 text-center text-slate-500">
                <Banknote className="w-6 h-6 animate-pulse mx-auto mb-2" />
                Calculating pricing...
              </div>
            ) : (
              <div className="space-y-6">
                
                {tripPlan.destinations.map((dest, index) => {
                  const pricing = pricingResults[dest.id];
                  if (!pricing) return null;
                  
                  const checkInD = new Date(dest.checkIn);
                  const checkOutD = new Date(dest.checkOut);
                  const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));
                  const tripDays = nights + 1;
                  const avgFood = dest.city?.avg_daily_food_cost || 25;
                  const avgTrans = dest.city?.avg_daily_transport_cost || 10;
                  const foodCost = avgFood * dest.guests * tripDays;
                  const transCost = avgTrans * dest.guests * tripDays;

                  return (
                    <div key={`cost-\${dest.id}`} className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Destination {index + 1}: {dest.city?.name || dest.city}</h4>
                      
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Base Price ({dest.rooms} Room x {nights} Nights)</span>
                        <span>{symbol}{convertFromUSD(pricing.totalPrice, userCurrency).toFixed(2)}</span>
                      </div>
                      
                      {pricing.activeDeal && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Flash Deal (-{pricing.activeDeal.discount_percentage}%)</span>
                          <span>Included</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>3% Tax</span>
                        <span>{symbol}{convertFromUSD(pricing.taxAmount, userCurrency).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Food Estimate</span>
                        <span>{symbol}{convertFromUSD(foodCost, userCurrency).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Transport Estimate</span>
                        <span>{symbol}{convertFromUSD(transCost, userCurrency).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm font-semibold text-brand-600 pt-1">
                        <span>Destination {index + 1} Total</span>
                        <span>{symbol}{convertFromUSD(pricing.finalTotal + foodCost + transCost, userCurrency).toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })}

                <div className="pt-2">
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-3">FINAL TRIP COST</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Accommodation</span>
                      <span>{symbol}{convertFromUSD(grandTotalHotel, userCurrency).toFixed(2)}</span>
                    </div>
                    {grandTotalDiscounts > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Flash Deals</span>
                        <span>-{symbol}{convertFromUSD(grandTotalDiscounts, userCurrency).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Food</span>
                      <span>{symbol}{convertFromUSD(grandTotalFood, userCurrency).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Transport</span>
                      <span>{symbol}{convertFromUSD(grandTotalTransport, userCurrency).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tax</span>
                      <span>{symbol}{convertFromUSD(grandTotalTax, userCurrency).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">GRAND TOTAL</span>
                      <span className="text-2xl font-black text-brand-600">{symbol}{convertFromUSD(grandTotalHotel + grandTotalTax + grandTotalFood + grandTotalTransport, userCurrency).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button onClick={handleDownloadPdf} className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg">
                  <Download className="w-5 h-5" /> Download Trip Report PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('frontend/src/pages/TripPlan.jsx', code);
console.log('CREATED TripPlan.jsx');
