const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Remove the old nearby services blocks
const oldNearbySection = `<div className="glass-panel p-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Nearby Services</span>
            </h4>
            {hotel.nearbyServices && hotel.nearbyServices.length > 0 ? (
              <div className="space-y-3">
                {hotel.nearbyServices.map((ns) => (
                  <div key={ns.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium truncate">{ns.service_name}</span>
                    <span className="text-slate-400">{ns.distance_km} km</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No nearby services listed.</p>
            )}
          </div>`;

code = code.replace(oldNearbySection, ``);

const oldAttractionsSection = `<div className="glass-panel p-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent-500" />
              <span>Attractions & Landmarks</span>
            </h4>
            {hotel.attractions && hotel.attractions.length > 0 ? (
              <div className="space-y-3">
                {hotel.attractions.map((ta) => (
                  <div key={ta.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium truncate">{ta.attraction_name}</span>
                    <span className="text-slate-400">{ta.distance_km} km</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No landmarks listed.</p>
            )}
          </div>`;

code = code.replace(oldAttractionsSection, ``);

// 2. Add the dynamic trip type and nearby places list under the map
const newPlacesList = `
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nearby Places (up to 3km)</h4>
                <div className="flex items-center gap-2 text-sm">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sort by Trip Type:</label>
                  <select value={tripType} onChange={(e) => setTripType(e.target.value)} className="input-field py-1">
                    <option value="family">Family</option>
                    <option value="business">Business</option>
                    <option value="couple">Couple</option>
                    <option value="solo">Solo</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyPlaces
                  .map(p => ({ ...p, dist: getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, p.lat, p.lon) }))
                  .filter(p => p.dist <= 3)
                  .sort((a,b) => getPlaceScore(b) - getPlaceScore(a))
                  .slice(0, 15) // show top 15
                  .map((place, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-900/50">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: place.color}}></div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{place.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{place.dist.toFixed(2)} km</span>
                    </div>
                ))}
                {nearbyPlaces.length === 0 && !isFetchingPlaces && (
                  <p className="text-sm text-slate-500">No places found within 3km.</p>
                )}
              </div>
            </div>
`;

code = code.replace(`</MapContainer>
            </div>
          </div>`, `</MapContainer>
            </div>
            ${newPlacesList}
          </div>`);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('UI patched');
