const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Fix TripType state and fetch logic
c = c.replace(
  "const [mapFilter, setMapFilter] = useState('all');",
  "const [mapFilter, setMapFilter] = useState('all');\n  const [tripType, setTripType] = useState(searchParams.get('trip_type') || 'family');"
);

const fetchStart = c.indexOf('const fetchNearbyPlaces = async (lat, lon) => {');
const fetchEndStr = 'setIsFetchingPlaces(false);\n    }\n  };';
const fetchEnd = c.indexOf(fetchEndStr) + fetchEndStr.length;

const newFetch = `const fetchNearbyPlaces = async (type) => {
    setIsFetchingPlaces(true);
    setNearbyPlaces([]);
    try {
      const res = await hotelService.getNearbyServices(id, type);
      if (res.success && res.data) {
        setNearbyPlaces(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };

  useEffect(() => {
    if (hotel?.id) {
      fetchNearbyPlaces(tripType);
    }
  }, [hotel?.id, tripType]);`;

c = c.substring(0, fetchStart) + newFetch + c.substring(fetchEnd);

// Remove the old fetchNearbyPlaces call
c = c.replace(
  `if (res.data.latitude && res.data.longitude) {\n          fetchNearbyPlaces(res.data.latitude, res.data.longitude);\n        }`,
  `// handled by useEffect`
);

// 2. Replace the old "Nearby Services" and "Tourist Attractions" cards with the NEW Nearby Services UI
const rightColStart = c.indexOf('{/* Nearby Services */}');
const rightColEndStr = `</p>\n              )}\n            </div>\n          </div>\n        </section>`;
const rightColEnd = c.indexOf(rightColEndStr) + rightColEndStr.length;

const newRightCol = `{/* Nearby Services Component */}
            <div className="glass-panel p-6">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-brand-400" />
                  <span>Nearby Services</span>
                </div>
              </h4>
              
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trip Type:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['family', 'business', 'couple', 'solo'].map(t => (
                    <button 
                      key={t}
                      type="button" 
                      onClick={() => setTripType(t)} 
                      className={\`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded border \${tripType === t ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700'}\`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {isFetchingPlaces ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span>Loading nearby services...</span>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {nearbyPlaces.map(place => (
                    <div key={place.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-1 hover:border-brand-300 transition-colors bg-slate-50 dark:bg-dark-950/50">
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{place.name}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-0.5 rounded text-white font-semibold text-[10px]" style={{backgroundColor: place.color || '#6366f1'}}>{place.displayCategory || place.category}</span>
                        <span className="text-slate-500 font-medium">{place.distanceKm?.toFixed(2)} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No nearby services listed.</p>
              )}
            </div>
          </div>
        </section>`;

c = c.substring(0, rightColStart) + newRightCol + c.substring(rightColEnd);

// 3. Clean up the Location section
// We want to keep ONLY the MapContainer and section.
const locStartStr = `{/* Location & Map Section */}`;
const locStart = c.indexOf(locStartStr);
const mapContainerStart = c.indexOf('<MapContainer', locStart);

// Keep the section start, remove the header and buttons
const sectionStartHTML = `{/* Location Map Section */}
        {(hotel.latitude && hotel.longitude) && (
          <section id="location" className="scroll-mt-24">
            <div className="glass-panel p-6 sm:p-8">
              <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                `;

c = c.substring(0, locStart) + sectionStartHTML + c.substring(mapContainerStart);

// 4. Update the Map markers
c = c.replace(/const dist = getDistanceFromLatLonInKm\(hotel\.latitude, hotel\.longitude, place\.lat, place\.lon\);/g, "const dist = place.distanceKm || 0;");
c = c.replace(/\{nearbyPlaces\.filter\(p => mapFilter === 'all' \|\| p\.group === mapFilter\)\.map\(\(place\) => \{/g, "{nearbyPlaces.map((place) => {");
c = c.replace(/center=\{\[place\.lat, place\.lon\]\}/g, "center={[place.latitude, place.longitude]}");
c = c.replace(/fillColor: place\.color,/g, "fillColor: place.color || '#6366f1',");
c = c.replace(/<div><strong>Category:<\/strong> <span className="px-2 py-0\.5 rounded text-white font-semibold text-\[10px\]" style=\{\{backgroundColor: place\.color\}\}>\{place\.category\}<\/span><\/div>/g, "<div><strong>Category:</strong> <span className=\"px-2 py-0.5 rounded text-white font-semibold text-[10px]\" style={{backgroundColor: place.color || '#6366f1'}}>{place.displayCategory || place.category}</span></div>");

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', c);
