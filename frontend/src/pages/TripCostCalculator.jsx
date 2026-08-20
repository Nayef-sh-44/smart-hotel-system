import React, { useState, useEffect } from 'react';
import { hotelService } from '../services/api.js';
import { useCurrency } from '../hooks/useCurrency.js';
import { Calculator, Hotel, Users, Calendar, Euro, MapPin, Coffee, Car, CreditCard, RotateCcw } from 'lucide-react';

export default function TripCostCalculator() {
  const { symbol, formatPrice, toEur } = useCurrency();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  const [activitiesCost, setActivitiesCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await hotelService.getAll();
      if (res.success && res.data) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error('Error fetching hotels for calculator:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived state
  const selectedHotel = hotels.find((h) => h.id === Number(selectedHotelId));
  const roomsForHotel = selectedHotel?.rooms || [];
  const selectedRoom = roomsForHotel.find((r) => r.id === Number(selectedRoomId));

  // Reset room selection when hotel changes
  useEffect(() => {
    if (roomsForHotel.length > 0 && !roomsForHotel.find(r => r.id === Number(selectedRoomId))) {
      setSelectedRoomId('');
    }
  }, [selectedHotelId]);

  // Calculations
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const totalGuests = Number(adults) + Number(children);
  
  const roomPricePerNight = selectedRoom ? Number(selectedRoom.price_per_night) : 0;
  const hotelCost = roomPricePerNight * Number(numRooms) * nights;
  
  // Trip days is usually nights + 1, but for food, some calculate it as nights or days. 
  // User specifically requested: "Food Cost = daily food cost per person × total guests × trip days."
  // And: "Trip days should be derived consistently from check-in/check-out."
  const tripDays = nights > 0 ? nights + 1 : 0;
  
  const cityAvgFood = selectedHotel?.city?.avg_daily_food_cost ? Number(selectedHotel.city.avg_daily_food_cost) : null;
  const cityAvgTransport = selectedHotel?.city?.avg_daily_transport_cost ? Number(selectedHotel.city.avg_daily_transport_cost) : null;

  const foodCost = cityAvgFood !== null ? Number(toEur(cityAvgFood)) * totalGuests * tripDays : 0;
  const transport = cityAvgTransport !== null ? Number(toEur(cityAvgTransport)) * totalGuests * tripDays : 0;
  
  const activities = Number(toEur(activitiesCost));
  const other = Number(toEur(otherCost));
  
  const totalCost = hotelCost + foodCost + transport + activities + other;

  // Validation
  const getValidationError = () => {
    if (selectedHotelId && !selectedRoomId) return "Please select a room type.";
    if (checkIn && checkOut && nights <= 0) return "Check-out must be after check-in date.";
    if (adults < 1) return "At least 1 adult is required.";
    if (numRooms < 1) return "At least 1 room is required.";
    if (activities < 0 || other < 0) return "Costs cannot be negative.";
    return null;
  };

  const validationError = getValidationError();
  const isValid = !validationError && selectedHotelId && selectedRoomId && nights > 0;

  const handleReset = () => {
    setSelectedHotelId('');
    setSelectedRoomId('');
    setCheckIn('');
    setCheckOut('');
    setAdults(1);
    setChildren(0);
    setNumRooms(1);
    setActivitiesCost(0);
    setOtherCost(0);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Cost Calculator</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Estimate the total expenses for your upcoming trip including stay, food, transport, and activities.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Hotel Selection */}
            <div className="bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-brand-500" /> Accommodation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Hotel</label>
                  <select 
                    value={selectedHotelId}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">{loading ? 'Loading hotels...' : '-- Choose a Hotel --'}</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Room Type</label>
                  <select 
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                    disabled={!selectedHotelId || roomsForHotel.length === 0}
                  >
                    <option value="">-- Choose a Room --</option>
                    {roomsForHotel.map(r => (
                      <option key={r.id} value={r.id}>{r.room_type} - {symbol}{formatPrice(r.price_per_night)}/night</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Check-in Date</label>
                  <input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Check-out Date</label>
                  <input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Guests & Rooms */}
            <div className="bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" /> Guests & Rooms
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rooms</label>
                  <input 
                    type="number" min="1"
                    value={numRooms}
                    onChange={(e) => setNumRooms(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Adults</label>
                  <input 
                    type="number" min="1"
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Children</label>
                  <input 
                    type="number" min="0"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Expenses */}
            <div className="bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-500" /> Additional Expenses ({symbol})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Car className="w-3 h-3"/> Daily Transport (per person)</label>
                  <div className="w-full bg-slate-100 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed">
                    {selectedHotelId && cityAvgTransport !== null 
                      ? `${symbol}${formatPrice(toEur(cityAvgTransport))} (City Avg)` 
                      : selectedHotelId ? 'No data available' : 'Select a hotel first'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Coffee className="w-3 h-3"/> Daily Food (per person)</label>
                  <div className="w-full bg-slate-100 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed">
                    {selectedHotelId && cityAvgFood !== null 
                      ? `${symbol}${formatPrice(toEur(cityAvgFood))} (City Avg)` 
                      : selectedHotelId ? 'No data available' : 'Select a hotel first'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3"/> Activities</label>
                  <input 
                    type="number" min="0"
                    value={activitiesCost}
                    onChange={(e) => setActivitiesCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Euro className="w-3 h-3"/> Other</label>
                  <input 
                    type="number" min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Cost Breakdown Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Estimated Total Cost</h2>
              
              {validationError && (
                <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  {validationError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Hotel ({nights} nights × {numRooms} room)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{formatPrice(hotelCost)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Food ({tripDays} days × {totalGuests} guests)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{formatPrice(foodCost)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Transportation</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{formatPrice(transport)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Activities</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{formatPrice(activities)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Other Expenses</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{symbol}{formatPrice(other)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">Total Trip Cost</span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {symbol}{isValid ? formatPrice(totalCost) : formatPrice(0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button 
                  type="button"
                  disabled={!isValid}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors text-white
                    ${isValid ? 'bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'}
                  `}
                >
                  Calculate
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
