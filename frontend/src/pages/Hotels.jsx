import React, { useState, useEffect } from 'react';
import { hotelService, cityService, recommendationService, amenityService } from '../services/api.js';
import { useCurrency } from '../hooks/useCurrency.js';
import HotelCard from '../components/HotelCard.jsx';
import { Search, MapPin, Sparkles, Hotel as HotelIcon, Award } from 'lucide-react';

export default function Hotels() {
  const { symbol, toEur } = useCurrency();
  const [hotels, setHotels] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  // Rich Search State
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [tripType, setTripType] = useState('family');

  useEffect(() => {
    const initData = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          cityService.getAll(),
          amenityService.getAll()
        ]);
        if (cRes.success) setCities(cRes.data);
        if (aRes.success) setAmenities(aRes.data);
      } catch (err) {
        console.error('Error loading filter data:', err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    fetchHotels();
    fetchRecommendations();
  }, [selectedCity, starFilter, targetPrice, selectedAmenities]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCity) params.city_id = selectedCity;
      if (starFilter) params.star_rating = starFilter;
      if (targetPrice) params.max_price = toEur(targetPrice);
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
      if (tripType) params.trip_type = tripType;
      if (guests) params.guests = guests;
      if (rooms) params.rooms = rooms;
      if (checkInDate) params.check_in = checkInDate;
      if (checkOutDate) params.check_out = checkOutDate;

      const res = await hotelService.getAll(params);
      if (Array.isArray(res)) {
        setHotels(res);
      } else if (res?.success) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const params = {
        limit: 3,
      };
      if (selectedCity) params.city_id = selectedCity;
      if (starFilter) params.min_stars = starFilter;
      if (targetPrice) params.target_price = toEur(targetPrice);
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
      if (tripType) params.trip_type = tripType;

      const res = await recommendationService.getRecommended(params);
      if (res.success) {
        setRecommendedHotels(res.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
    fetchRecommendations();
  };

  const handleAmenityToggle = (id) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  // Only show the top 6 amenities for simplicity
  const topAmenities = amenities.slice(0, 6);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      {/* Unified Search Header */}
      <section className="relative overflow-hidden pt-10 pb-12 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Find Your Perfect{' '}
              <span className="text-brand-600 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-400 dark:via-blue-400 dark:to-accent-500 dark:bg-clip-text">
                Luxury Stay
              </span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Discover top-rated hotels, exclusive deals, and AI-powered recommendations in one place.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto">
            
            {/* RICH SEARCH PANEL */}
            <div className="glass-panel p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Row 1: Destination, Dates, Guests/Rooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Destination */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="input-field pl-9 text-sm w-full font-semibold"
                    >
                      <option value="">Any Destination</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Check-In */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-in</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>

                {/* Check-Out */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-out</label>
                  <input
                    type="date"
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>

                {/* Search Button */}
                <button type="submit" className="btn-primary w-full py-2.5">
                  Search
                </button>
              </div>

              {/* Row 2: Guests, Rooms, Trip Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trip Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['business', 'family', 'couple', 'solo'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTripType(type)}
                        className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                          tripType === type 
                          ? 'bg-brand-600 text-white' 
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Search & Core Filters */}
            <div className="glass-panel p-4 mt-4 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Keyword */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hotel names or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12 bg-white dark:bg-dark-950/60"
                  />
                </div>

                {/* Star Rating */}
                <div className="w-full md:w-48 shrink-0">
                  <select
                    value={starFilter}
                    onChange={(e) => setStarFilter(e.target.value)}
                    className="input-field bg-white dark:bg-dark-950/60 font-medium"
                  >
                    <option value="">Any Star Rating</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                {/* Target Budget */}
                <div className="w-full md:w-48 shrink-0 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">{symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="Max Price / Night"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="input-field pl-8 bg-white dark:bg-dark-950/60 font-medium"
                  />
                </div>
              </div>

              {/* Top Amenities */}
              {topAmenities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Services</label>
                  <div className="flex flex-wrap gap-2">
                    {topAmenities.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleAmenityToggle(a.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                          selectedAmenities.includes(a.id)
                            ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/40'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Recommended Hotels Section */}
        {recommendedHotels.length > 0 && !loadingRecs && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {recommendedHotels.map((item) => (
                <div key={`rec-${item.hotel.id}`} className="relative group">
                  <div className="absolute -top-3 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{Math.min(99, item.recommendationScore)}% Match</span>
                  </div>
                  <HotelCard hotel={item.hotel} />
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 px-2">
                    <Award className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="truncate">{item.matchReasons[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Hotels Section */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Explore All Hotels</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{hotels.length} hotels found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="glass-card h-96 animate-pulse">
                  <div className="h-56 bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20 glass-panel max-w-md mx-auto">
              <HotelIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No hotels found</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                  
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setCheckInDate(d.toISOString().split('T')[0]);
                  d.setDate(d.getDate() + 2);
                  setCheckOutDate(d.toISOString().split('T')[0]);
                  setGuests('2');
                  setRooms('1');
                  setTripType('family');
                }}
                className="btn-primary mx-auto"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={`all-${hotel.id}`} hotel={hotel} />
              ))}
            </div>
            )}
          </section>
      </div>
    </div>
  );
}
