import React, { useState, useEffect } from 'react';
import { hotelService, cityService, recommendationService, amenityService, favoriteService } from '../services/api.js';
import { useCurrency } from '../hooks/useCurrency.js';
import { useAuth } from '../context/AuthContext.jsx';
import HotelCard from '../components/HotelCard.jsx';
import { Search, MapPin, Sparkles, Hotel as HotelIcon, Award } from 'lucide-react';

export default function Hotels() {
  const { symbol, currency } = useCurrency();
  const [hotels, setHotels] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const { isAuthenticated } = useAuth();
  
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
        const promises = [
          cityService.getAll(),
          amenityService.getAll()
        ];
        if (isAuthenticated) {
          promises.push(favoriteService.getAll());
        }
        const results = await Promise.all(promises);
        if (results[0].success) setCities(results[0].data);
        if (results[1].success) setAmenities(results[1].data);
        if (isAuthenticated && results[2] && results[2].success) {
          setUserFavorites(results[2].data.map(f => f.hotel_id));
        }
      } catch (err) {
        console.error('Error loading filter data:', err);
      }
    };
    initData();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHotels();
  }, [selectedCity, starFilter, targetPrice, selectedAmenities, tripType]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCity) params.city_id = selectedCity;
      if (starFilter) params.star_rating = starFilter;
      if (targetPrice) {
        params.max_price = targetPrice;
        params.user_currency = currency;
      }
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
      if (tripType) params.trip_type = tripType;
      if (guests) params.guests = guests;
      if (rooms) params.rooms = rooms;
      if (checkInDate) params.check_in = checkInDate;
      if (checkOutDate) params.check_out = checkOutDate;

      const res = await hotelService.getAll(params);
      let fetchedHotels = [];
      if (Array.isArray(res)) {
        fetchedHotels = res;
      } else if (res?.success) {
        fetchedHotels = res.data;
      }
      setHotels(fetchedHotels);
      
      const hotelIds = fetchedHotels.map(h => h.id);
      fetchRecommendations(hotelIds);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (hotelIds) => {
    if (!hotelIds || hotelIds.length === 0) {
      setRecommendedHotels([]);
      return;
    }
    
    setLoadingRecs(true);
    try {
      const params = {
        limit: 3,
        hotel_ids: hotelIds.join(',')
      };
      if (targetPrice) {
        params.target_price = targetPrice;
        params.user_currency = currency;
      }
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

          
          <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto space-y-6">
            
            {/* HOTEL NAME SEARCH */}
            <div className="glass-panel p-5 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Search Hotels</h3>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hotel names or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 bg-white dark:bg-dark-950/60 w-full py-3"
                />
              </div>
            </div>

            {/* MAIN SEARCH SECTION */}
            <div className="glass-panel p-5 animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Trip Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
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

                {/* Guests */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rooms</label>
                  <input
                    type="number"
                    min="1"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="input-field text-sm w-full"
                  />
                </div>

                {/* Trip Type */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trip Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['business', 'family', 'couple', 'solo'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTripType(type)}
                        className={"px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors " + (tripType === type ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white')}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* FILTER SECTION */}
            <div className="glass-panel p-5 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
                {/* Star Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Star Rating</label>
                  <select
                    value={starFilter}
                    onChange={(e) => setStarFilter(e.target.value)}
                    className="input-field bg-white dark:bg-dark-950/60 font-medium w-full"
                  >
                    <option value="">Any Star Rating</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                {/* Target Budget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Price / Night</label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="Max Price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="input-field pl-8 bg-white dark:bg-dark-950/60 font-medium w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Top Amenities */}
              {topAmenities.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Services</label>
                  <div className="flex flex-wrap gap-2">
                    {topAmenities.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleAmenityToggle(a.id)}
                        className={"px-3 py-1.5 rounded-full text-xs font-medium transition-colors border " + (selectedAmenities.includes(a.id) ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/40' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white')}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          
            {/* FINAL SEARCH BUTTON */}
            <div className="flex justify-center pt-8 mt-8 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="submit"
                className="w-full sm:w-2/3 md:w-1/2 bg-brand-600 hover:bg-brand-700 text-white py-4 px-8 rounded-xl shadow-xl shadow-brand-500/20 dark:shadow-brand-900/20 font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-6 h-6" /> Search
              </button>
            </div>
</form>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* City Information Section */}
        {selectedCity && cities.length > 0 && (
          <section>
            {(() => {
              const currentCity = cities.find((c) => c.id === parseInt(selectedCity));
              if (!currentCity || (!currentCity.best_visit_months && !currentCity.weather_description)) return null;
              
              return (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-brand-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      About {currentCity.name}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentCity.best_visit_months && (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Best Time to Visit
                        </span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {currentCity.best_visit_months}
                        </span>
                      </div>
                    )}
                    
                    {currentCity.weather_description && (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Weather Information
                        </span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {currentCity.weather_description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        )}
        {/* Recommended Hotels Section */}
        {!loadingRecs && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</h2>
            </div>
            
            {recommendedHotels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {recommendedHotels.map((item) => (
                  <div key={`rec-${item.hotel.id}`} className="relative group">
                    <div className="absolute -top-3 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.min(99, item.recommendationScore)}% Match</span>
                    </div>
                    <HotelCard hotel={item.hotel} isFavoriteInitial={userFavorites.includes(item.hotel.id)} />
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 px-2">
                      <Award className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{item.matchReasons[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                No hotels match your selected criteria.
              </div>
            )}
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
                <HotelCard key={`all-${hotel.id}`} hotel={hotel} isFavoriteInitial={userFavorites.includes(hotel.id)} />
              ))}
            </div>
            )}
          </section>
      </div>
    </div>
  );
}
