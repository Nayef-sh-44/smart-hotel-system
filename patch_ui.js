const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const uiStart = c.indexOf('<div className="flex flex-wrap gap-2">');
const uiEnd = c.indexOf('<div style={{ height: \'500px\'');
const uiCode = c.substring(uiStart, uiEnd);

const newUiCode = `<div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trip Type:</span>
                    <div className="flex flex-wrap gap-2">
                      {['family', 'business', 'couple', 'solo'].map(t => (
                        <button 
                          key={t}
                          type="button" 
                          onClick={() => setTripType(t)} 
                          className={\`px-3 py-1 text-xs rounded-full border \${tripType === t ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700'}\`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category Filter:</span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setMapFilter('all')} className={\`px-3 py-1 text-xs rounded-full border \${mapFilter === 'all' ? 'bg-slate-800 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700'}\`}>All Categories</button>
                    </div>
                  </div>
                </div>

                {isFetchingPlaces && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    <span>Fetching real-time OpenStreetMap / Overpass API surrounding attractions...</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }} className="border border-slate-200 dark:border-slate-700">
`;

c = c.replace(uiCode, newUiCode);

// Add the list to the right of the map
const mapEndIdx = c.indexOf('</MapContainer>');
const mapBlockEnd = c.indexOf('</div>', mapEndIdx); // the closing div of the map
const mapBlockEnd2 = c.indexOf('</div>', mapBlockEnd + 6); // the closing div of the panel?
// Actually just replace </MapContainer>\n              </div>
const mapEndToReplace = '</MapContainer>\n              </div>';
const newMapEnd = `</MapContainer>
                  </div>
                </div>
                
                <div className="lg:col-span-1 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="font-bold text-slate-900 dark:text-white sticky top-0 bg-white dark:bg-dark-900 py-2 z-10 border-b border-slate-100 dark:border-slate-800">Nearby Places List</h4>
                  {nearbyPlaces.length === 0 && !isFetchingPlaces && (
                    <p className="text-sm text-slate-500">No places found nearby.</p>
                  )}
                  {nearbyPlaces.filter(p => mapFilter === 'all' || p.category === mapFilter).map(place => (
                    <div key={place.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-1 hover:border-brand-300 transition-colors bg-slate-50 dark:bg-dark-950/50">
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{place.name}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-0.5 rounded text-white font-semibold text-[10px]" style={{backgroundColor: place.color}}>{place.displayCategory || place.category}</span>
                        <span className="text-slate-500 font-medium">{place.distanceKm?.toFixed(2)} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>`;

c = c.replace(mapEndToReplace, newMapEnd);

// Fix the map marker rendering
// Old marker rendering uses distance calculation which is now provided by backend
c = c.replace(/const dist = getDistanceFromLatLonInKm\(hotel\.latitude, hotel\.longitude, place\.lat, place\.lon\);/g, "const dist = place.distanceKm || 0;");

// Update filter condition for markers
c = c.replace(/\{nearbyPlaces\.filter\(p => mapFilter === 'all' \|\| p\.group === mapFilter\)\.map\(\(place\) => \{/g, "{nearbyPlaces.filter(p => mapFilter === 'all' || p.category === mapFilter).map((place) => {");

// Update lat/lon to match backend which sends latitude/longitude instead of lat/lon
c = c.replace(/center=\{\[place\.lat, place\.lon\]\}/g, "center={[place.latitude, place.longitude]}");
c = c.replace(/getDistanceFromLatLonInKm\(hotel\.latitude, hotel\.longitude, place\.latitude, place\.longitude\)/g, "place.distanceKm || 0");

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', c);
