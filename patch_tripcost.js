const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelService } from '../services/api.js';
import { useCurrency } from '../hooks/useCurrency.js';
import { useTrip } from '../context/TripContext.jsx';
import html2pdf from 'html2pdf.js';
import { Calculator, Hotel, Users, Calendar, Banknote, MapPin, Coffee, Car, CreditCard, RotateCcw, Plus, Trash2, Download, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripCostCalculator() {
  const { symbol, convertFromUSD, currency: userCurrency } = useCurrency();
  const { tripPlan, removeDestination, clearTrip } = useTrip();
  const navigate = useNavigate();
  
  const [pricingResults, setPricingResults] = useState({});
  const [loadingPricing, setLoadingPricing] = useState(false);
  
  const reportRef = useRef(null);

  useEffect(() => {
    fetchAllPricing();
  }, [tripPlan.destinations]);

  const fetchAllPricing = async () => {
    if (!tripPlan.destinations || tripPlan.destinations.length === 0) return;
    
    setLoadingPricing(true);
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
        console.error('Failed to get pricing for dest:', dest.id, err);
      }
    }
    setPricingResults(results);
    setLoadingPricing(false);
  };

  const handleDownloadPdf = () => {
    const element = reportRef.current;
    if (!element) return;
    
    toast.success('Generating PDF...');
    
    const opt = {
      margin:       10,
      filename:     'Trip_Plan_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Calculations
  let grandTotalHotel = 0;
  let grandTotalFood = 0;
  let grandTotalTransport = 0;
  let grandTotalTax = 0;
  let totalTripNights = 0;

  if (tripPlan.destinations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20 bg-white dark:bg-dark-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center rounded-full mx-auto mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Trip Plan is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Start planning your next adventure by adding destinations.</p>
          <button
            onClick={() => navigate('/hotels')}
            className="btn-primary"
          >
            Explore Hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calculator className="w-8 h-8 text-brand-500" />
            Trip Cost Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Review your itinerary, automatic pricing, and download your summary.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/hotels')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Destination
          </button>
          <button onClick={clearTrip} className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold transition-colors">
            <Trash2 className="w-4 h-4" /> Clear Trip
          </button>
        </div>
      </div>

      {/* PDF Report Container */}
      <div ref={reportRef} className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8">
        
        {/* PDF Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">SMART HOTEL PRO</h2>
          <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400 mt-1">TRIP REPORT</h3>
          
          <div className="flex justify-center gap-8 mt-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> {tripPlan.destinations.length} Destinations</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> Trip Type: {tripPlan.tripType || 'Standard'}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
          {tripPlan.destinations.map((dest, index) => {
            const pricing = pricingResults[dest.id];
            
            // Calculate nights
            const checkInD = new Date(dest.checkIn);
            const checkOutD = new Date(dest.checkOut);
            const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));
            const tripDays = nights + 1;
            totalTripNights += nights;

            // Food & Transport
            const avgFood = dest.city?.avg_daily_food_cost ? Number(dest.city.avg_daily_food_cost) : 0;
            const avgTrans = dest.city?.avg_daily_transport_cost ? Number(dest.city.avg_daily_transport_cost) : 0;
            const foodCost = avgFood * dest.guests * tripDays;
            const transCost = avgTrans * dest.guests * tripDays;
            
            grandTotalFood += foodCost;
            grandTotalTransport += transCost;

            let hotelCost = 0;
            let taxCost = 0;
            let finalHotelTotal = 0;

            if (pricing) {
              hotelCost = pricing.totalPrice;
              taxCost = pricing.taxAmount;
              finalHotelTotal = pricing.finalTotal;
              grandTotalHotel += hotelCost;
              grandTotalTax += taxCost;
            }

            return (
              <div key={dest.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-dark-950 bg-brand-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {index + 1}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-dark-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dest.hotelName}</h4>
                      <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">{dest.city?.name || 'City'}</p>
                    </div>
                    <button onClick={() => removeDestination(dest.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> In: {dest.checkIn}</div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Out: {dest.checkOut}</div>
                    <div className="flex items-center gap-1"><Hotel className="w-3 h-3"/> {dest.rooms} {dest.roomName} Room(s)</div>
                    <div className="flex items-center gap-1"><Users className="w-3 h-3"/> {dest.guests} Guests</div>
                  </div>

                  {!pricing ? (
                    <div className="text-center py-4 text-sm text-slate-500"><Banknote className="w-4 h-4 animate-spin mx-auto mb-2"/> Calculating pricing...</div>
                  ) : (
                    <div className="space-y-3">
                      {/* Nightly Breakdown */}
                      <div className="bg-white dark:bg-dark-950 rounded p-3 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Night-by-Night Preview</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                          {pricing.nightlyBreakdown?.map((night, i) => (
                            <div key={i} className="flex justify-between text-[11px] text-slate-500">
                              <span>{night.date} ({night.dayType})</span>
                              <span>{symbol}{convertFromUSD(night.final_price, userCurrency).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {pricing.activeDeal && (
                          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded">
                            Flash Deal Active: {pricing.activeDeal.discount_percentage}% OFF
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Hotel Subtotal</span><span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{convertFromUSD(hotelCost, userCurrency).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Taxes (3%)</span><span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{convertFromUSD(taxCost, userCurrency).toFixed(2)}</span></div>
                        {foodCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Est. Food</span><span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{convertFromUSD(foodCost, userCurrency).toFixed(2)}</span></div>}
                        {transCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Est. Transport</span><span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{convertFromUSD(transCost, userCurrency).toFixed(2)}</span></div>}
                        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 font-bold text-brand-600 dark:text-brand-400">
                          <span>Destination Total</span>
                          <span>{symbol}{convertFromUSD(finalHotelTotal + foodCost + transCost, userCurrency).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total Summary */}
        <div className="mt-12 bg-slate-50 dark:bg-dark-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">Trip Cost Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Destinations</span><span className="font-semibold text-slate-800 dark:text-slate-200">{tripPlan.destinations.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Nights</span><span className="font-semibold text-slate-800 dark:text-slate-200">{totalTripNights} Nights</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Accommodation</span><span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{convertFromUSD(grandTotalHotel, userCurrency).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Taxes</span><span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{convertFromUSD(grandTotalTax, userCurrency).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Est. Food</span><span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{convertFromUSD(grandTotalFood, userCurrency).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Total Est. Transport</span><span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{convertFromUSD(grandTotalTransport, userCurrency).toFixed(2)}</span></div>
            </div>
            <div className="bg-brand-600 rounded-xl p-6 text-white flex flex-col justify-center items-center shadow-lg">
              <span className="text-brand-100 font-medium mb-1">Final Trip Cost</span>
              <span className="text-4xl font-black">{symbol}{convertFromUSD(grandTotalHotel + grandTotalTax + grandTotalFood + grandTotalTransport, userCurrency).toFixed(2)}</span>
              <span className="text-xs text-brand-200 mt-2 text-center opacity-80">This is a preview. No reservations have been made. Loyalty points are preserved.</span>
            </div>
          </div>
        </div>
        
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          <Download className="w-5 h-5" /> Download Professional PDF Report
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/TripCostCalculator.jsx', code);
console.log('PATCHED TRIP COST');
