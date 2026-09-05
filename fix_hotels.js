const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const oldFormStart = '<form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto">';
const oldFormEnd = '</form>';

const startIndex = code.indexOf(oldFormStart);
const endIndex = code.indexOf(oldFormEnd) + oldFormEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("NOT FOUND!");
  process.exit(1);
}

const newForm = `
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

              {/* Centered Search Button in a separate row */}
              <div className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                <button
                  type="submit"
                  className="w-full sm:w-2/3 md:w-1/2 bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" /> Search
                </button>
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
          </form>
`;

code = code.substring(0, startIndex) + newForm + code.substring(endIndex);
fs.writeFileSync('frontend/src/pages/Hotels.jsx', code);
console.log('SUCCESS');
