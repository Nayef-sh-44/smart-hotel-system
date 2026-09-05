import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { useComparison } from '../context/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Hotel, Trash2, Edit2, Plus, Download, Banknote, CheckCircle, CreditCard, X } from 'lucide-react';
import { hotelService, bookingService } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TripPlan() {
  const { tripPlan, removeDestination, updateDestination, updateTripDetails, clearTrip } = useTrip();
  const { currency: userCurrency, conversionRates } = useComparison();
  const navigate = useNavigate();
  
  const [pricingResults, setPricingResults] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [editDest, setEditDest] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const [bookDest, setBookDest] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  
  const [pendingReward, setPendingReward] = useState(null);
  const [applyReward, setApplyReward] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const convertFromUSD = (usdAmount, targetCurrency) => {
    if (targetCurrency === 'USD') return usdAmount;
    if (!conversionRates || !conversionRates[targetCurrency]) return usdAmount;
    return usdAmount * conversionRates[targetCurrency];
  };

  const symbol = userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : userCurrency === 'SYP' ? 'SYP ' : userCurrency === 'AED' ? 'AED ' : '$';

  const fetchPricingForDestinations = async () => {
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
        console.error("Error calculating price", dest.id, err);
      }
    }
    setPricingResults(results);
    setIsCalculating(false);
  };

  useEffect(() => {
    fetchPricingForDestinations();
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
        grandTotalDiscounts += (pricing.totalPrice * pricing.activeDeal.percentage / 100);
      }
    }
  });

  const handleEditClick = (dest) => {
    setEditDest(dest.id);
    setEditForm({
      checkIn: dest.checkIn,
      checkOut: dest.checkOut,
      guests: dest.guests,
      rooms: dest.rooms
    });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    const ci = new Date(editForm.checkIn);
    const co = new Date(editForm.checkOut);
    if (co <= ci) {
      toast.error('Check-out must be after check-in');
      return;
    }
    updateDestination(editDest, {
      checkIn: editForm.checkIn,
      checkOut: editForm.checkOut,
      guests: Number(editForm.guests),
      rooms: Number(editForm.rooms)
    });
    setEditDest(null);
    toast.success('Destination updated successfully');
  };

  const handleBookClick = async (dest) => {
    setBookDest(dest);
    setPendingReward(null);
    setApplyReward(false);
    try {
      const { loyaltyService } = await import('../services/api.js');
      const res = await loyaltyService.getLoyaltyForHotel(dest.hotelId);
      if (res.success && res.data) {
        setLoyaltyPoints(res.data.points || 0);
        if (res.data.rewardInstances) {
          const unredeemed = res.data.rewardInstances.filter(r => !r.is_redeemed);
          if (unredeemed.length > 0) {
            const oldest = unredeemed.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))[0];
            setPendingReward(oldest);
          }
        }
      }
    } catch(e) {}
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    try {
      const payload = {
        hotel_id: bookDest.hotelId,
        room_id: bookDest.roomId,
        check_in_date: bookDest.checkIn,
        check_out_date: bookDest.checkOut,
        num_guests: parseInt(bookDest.guests, 10),
        num_rooms: parseInt(bookDest.rooms, 10),
        special_requests: "Booked via Trip Plan",
        instance_id: applyReward && pendingReward && pendingReward.id ? pendingReward.id : null
      };
      
      const res = await bookingService.create(payload);
      if (res.success) {
        toast.success(`Booking confirmed for ${bookDest.hotelName}!`);
        // We don't remove it from trip plan so they keep their itinerary, 
        // but they can now see it in My Bookings
        setBookDest(null);
        navigate('/my-bookings');
      }
    } catch (err) {
      console.error("Booking Error:", err);
      toast.error(err.error?.message || 'Failed to complete reservation.');
    }
    setIsBooking(false);
  };

  const handleDownloadPdf = () => {
    toast.success('Generating Professional PDF Report...');
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); 
    doc.text('SmartHotel Pro', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('TRIP REPORT & ITINERARY', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Trip Summary
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Trip Name: ${tripPlan.name || 'My Trip'}`, 14, yPos);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Trip Type: ${tripPlan.tripType || 'Standard'}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Destinations: ${tripPlan.destinations.length}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Nights: ${totalTripNights}`, 14, yPos);
    
    let totalHotels = tripPlan.destinations.length;
    let totalRooms = tripPlan.destinations.reduce((acc, d) => acc + d.rooms, 0);
    let totalGuests = tripPlan.destinations.reduce((acc, d) => acc + d.guests, 0);
    yPos += 6;
    doc.text(`Total Rooms: ${totalRooms} | Total Guests: ${totalGuests}`, 14, yPos);

    yPos += 12;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 15;

    // Iterate through Destinations
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

      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text(`DESTINATION ${index + 1}: ${dest.city?.name || dest.city || 'City'}`, 14, yPos);
      yPos += 8;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`Hotel: ${dest.hotelName}`, 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;
      doc.text(`Room Type: ${dest.roomName}`, 14, yPos);
      doc.text(`Rooms: ${dest.rooms} | Guests: ${dest.guests}`, 120, yPos);
      yPos += 6;
      doc.text(`Check-in: ${dest.checkIn}`, 14, yPos);
      doc.text(`Check-out: ${dest.checkOut} (${nights} Nights)`, 120, yPos);
      yPos += 10;

      if (pricing && pricing.nightlyBreakdown && pricing.nightlyBreakdown.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Night-by-Night Pricing Breakdown:', 14, yPos);
        yPos += 4;
        
        const tableData = pricing.nightlyBreakdown.map((night, i) => [
          `Night ${i + 1} - ${night.date}`,
          night.dayType,
          symbol + convertFromUSD(night.base_price, userCurrency).toFixed(2),
          night.multiplier + 'x',
          symbol + convertFromUSD(night.final_price, userCurrency).toFixed(2)
        ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Day Type', 'Base Rate', 'Dynamic', 'Night Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
      }

      if (pricing && pricing.activeDeal) {
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129); // emerald
        doc.text(`Flash Deal / Promotion Applied: ${pricing.activeDeal.title || pricing.activeDeal.percentage + '% OFF'}`, 14, yPos);
        yPos += 6;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Flash Deal: None`, 14, yPos);
        yPos += 6;
      }
      doc.text(`Loyalty Reward: None`, 14, yPos);
      yPos += 6;

      doc.setTextColor(0, 0, 0);
      doc.text(`Base Accommodation: ${symbol}${convertFromUSD(hotelCost, userCurrency).toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Taxes (3%): ${symbol}${convertFromUSD(taxCost, userCurrency).toFixed(2)}`, 14, yPos);
      yPos += 6;
      
      doc.setFont(undefined, 'bold');
      doc.text(`Final Hotel Total: ${symbol}${convertFromUSD(finalHotelTotal, userCurrency).toFixed(2)}`, 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 10;

      // Trip Expenses
      doc.setTextColor(100, 100, 100);
      doc.text('Estimated Local Expenses:', 14, yPos);
      yPos += 6;
      doc.setTextColor(0, 0, 0);
      doc.text(`Food Estimate: ${symbol}${convertFromUSD(foodCost, userCurrency).toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Transport Estimate: ${symbol}${convertFromUSD(transCost, userCurrency).toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL FOR DESTINATION ${index + 1}: ${symbol}${convertFromUSD(finalHotelTotal + foodCost + transCost, userCurrency).toFixed(2)}`, 14, yPos);
      doc.setFont(undefined, 'normal');
      
      yPos += 15;
    });

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(50, 50, 50);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;
    
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('FINAL TRIP SUMMARY', 14, yPos);
    yPos += 12;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Accommodation: ${symbol}${convertFromUSD(grandTotalHotel, userCurrency).toFixed(2)}`, 14, yPos);
    yPos += 8;
    if (grandTotalDiscounts > 0) {
        doc.setTextColor(16, 185, 129);
        doc.text(`Total Discounts: -${symbol}${convertFromUSD(grandTotalDiscounts, userCurrency).toFixed(2)}`, 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;
    }
    doc.text(`Total Tax: ${symbol}${convertFromUSD(grandTotalTax, userCurrency).toFixed(2)}`, 14, yPos);
    yPos += 8;
    doc.text(`Total Food Estimate: ${symbol}${convertFromUSD(grandTotalFood, userCurrency).toFixed(2)}`, 14, yPos);
    yPos += 8;
    doc.text(`Total Transport Estimate: ${symbol}${convertFromUSD(grandTotalTransport, userCurrency).toFixed(2)}`, 14, yPos);
    yPos += 12;

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    const grandTotal = grandTotalHotel + grandTotalTax + grandTotalFood + grandTotalTransport;
    doc.text(`GRAND TOTAL: ${symbol}${convertFromUSD(grandTotal, userCurrency).toFixed(2)}`, 14, yPos);
    
    const safeName = (tripPlan.name || 'Trip').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`SmartHotel-Trip-Report-${safeName}.pdf`);
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
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trip Type</label>
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
          </section>

          <section className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">DESTINATIONS</h2>
            
            <div className="space-y-6">
              {tripPlan.destinations.map((dest, index) => {
                const checkInD = new Date(dest.checkIn);
                const checkOutD = new Date(dest.checkOut);
                const nights = Math.max(1, Math.ceil((checkOutD - checkInD) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={dest.id} className="relative p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-brand-600 bg-brand-100 dark:bg-brand-900/30 px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                          Destination {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{dest.city?.name || dest.city || 'City'}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleBookClick(dest)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white hover:bg-brand-700 rounded-lg text-xs font-bold transition-colors shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" /> Book
                        </button>
                        <button onClick={() => handleEditClick(dest)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeDestination(dest.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Hotel</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.hotelName}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Room</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.roomName}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Rooms</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.rooms}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Guests</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.guests}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Check-in</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.checkIn}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Check-out</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{dest.checkOut}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Nights</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">{nights}</span>
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
                    <div key={`cost-${dest.id}`} className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Destination {index + 1}: {dest.city?.name || dest.city}</h4>
                      
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Base Price ({dest.rooms} Room x {nights} Nights)</span>
                        <span>{symbol}{convertFromUSD(pricing.totalPrice, userCurrency).toFixed(2)}</span>
                      </div>
                      
                      {pricing.activeDeal && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Flash Deal (-{pricing.activeDeal.percentage || pricing.activeDeal.discount_percentage}%)</span>
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

      {/* EDIT MODAL */}
      {editDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setEditDest(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Destination</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Check-in</label>
                  <input type="date" value={editForm.checkIn} onChange={e => setEditForm({...editForm, checkIn: e.target.value})} className="input-field w-full text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Check-out</label>
                  <input type="date" value={editForm.checkOut} onChange={e => setEditForm({...editForm, checkOut: e.target.value})} className="input-field w-full text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Guests</label>
                  <input type="number" min="1" value={editForm.guests} onChange={e => setEditForm({...editForm, guests: e.target.value})} className="input-field w-full text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Rooms</label>
                  <input type="number" min="1" value={editForm.rooms} onChange={e => setEditForm({...editForm, rooms: e.target.value})} className="input-field w-full text-sm" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full btn-primary py-2.5 text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING CONFIRMATION MODAL */}
      {bookDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button disabled={isBooking} onClick={() => setBookDest(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Booking</h3>
            <p className="text-sm text-slate-500 mb-4 border-b border-slate-100 pb-4">
              You are about to book {bookDest.hotelName} in {bookDest.city?.name || bookDest.city}.
            </p>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-semibold">{bookDest.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-semibold">{bookDest.checkIn} to {bookDest.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests & Rooms:</span>
                <span className="font-semibold">{bookDest.guests} Guests, {bookDest.rooms} Rooms</span>
              </div>
              
              {pricingResults[bookDest.id] && (() => {
                  const rawTotal = pricingResults[bookDest.id].finalTotal;
                  let discount = 0;
                  if (applyReward && pendingReward && pendingReward.reward) {
                    if (pendingReward.reward.reward_type === 'percentage_discount') {
                      discount = rawTotal * (Number(pendingReward.reward.reward_value) / 100);
                    } else {
                      discount = Number(pendingReward.reward.reward_value);
                    }
                  }
                  const finalTotal = Math.max(0, rawTotal - discount);
                  
                  return (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hotel Total:</span>
                        <span className="font-bold text-brand-600">{symbol}{convertFromUSD(finalTotal, userCurrency).toFixed(2)}</span>
                      </div>
                      {pricingResults[bookDest.id].activeDeal && (
                        <p className="text-xs text-emerald-600 text-right mt-1">Includes flash deal discount!</p>
                      )}
                      {applyReward && (
                        <p className="text-xs text-brand-600 text-right mt-1">Includes Loyalty Discount (-{symbol}{convertFromUSD(discount, userCurrency).toFixed(2)})</p>
                      )}
                    </div>
                  );
              })()}
            </div>

            {pendingReward && (
                <div className="mb-6 flex flex-col gap-2">
                  {!applyReward ? (
                    <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-lg flex items-center justify-between border border-brand-200 dark:border-brand-800">
                      <div>
                        <p className="text-xs font-bold text-brand-700 dark:text-brand-400">🎁 Loyalty Reward Available</p>
                        <p className="text-[10px] text-brand-600 dark:text-brand-500">
                          {pendingReward.reward.reward_name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApplyReward(true)}
                        className="px-3 py-1 bg-brand-500 text-white rounded text-xs font-bold hover:bg-brand-600"
                      >
                        Use Reward
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Loyalty Reward Applied</p>
                        <button
                          type="button"
                          onClick={() => setApplyReward(false)}
                          className="text-[10px] text-emerald-600 underline hover:text-emerald-700"
                        >
                          Remove Reward
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button 
              onClick={handleConfirmBooking} 
              disabled={isBooking}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isBooking ? 'Processing...' : (
                <>
                  <CreditCard className="w-5 h-5" /> Complete Reservation
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
