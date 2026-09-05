const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Update the cache key and mapping logic
const fetchStart = 'const fetchNearbyPlaces = async (lat, lon) => {';
const fetchEnd = 'setIsFetchingPlaces(false);\n    }\n  };';
const fetchStartIndex = code.indexOf(fetchStart);
const fetchEndIndex = code.indexOf(fetchEnd) + fetchEnd.length;

if (fetchStartIndex === -1 || fetchEndIndex === -1) { console.log('FETCH NOT FOUND', fetchStartIndex, fetchEndIndex); process.exit(1); }

const newFetch = `
  const fetchNearbyPlaces = async (lat, lon) => {
    const cacheKey = \`overpass_v2_\${id}_\${lat}_\${lon}\`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setNearbyPlaces(JSON.parse(cached));
        return;
      } catch (e) {}
    }

    setIsFetchingPlaces(true);
    setNearbyPlaces([]);
    try {
      const overpassQuery = \`[out:json][timeout:15];
      (
        node["amenity"~"atm|bank|restaurant|fast_food|cafe|hospital|clinic|pharmacy|bus_station|cinema|theatre|place_of_worship"](around:3000,\${lat},\${lon});
        node["shop"~"supermarket|mall|convenience"](around:3000,\${lat},\${lon});
        node["public_transport"~"station"](around:3000,\${lat},\${lon});
        node["railway"~"station"](around:3000,\${lat},\${lon});
        node["aeroway"~"aerodrome"](around:3000,\${lat},\${lon});
        node["leisure"~"park|playground|water_park|swimming_pool|stadium|sports_centre"](around:3000,\${lat},\${lon});
        node["tourism"~"theme_park|zoo|attraction|museum|gallery|information"](around:3000,\${lat},\${lon});
      );
      out body 250;\`;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      const data = await res.json();
      
      if (data && data.elements) {
        const places = [];
        data.elements.forEach(node => {
          if (!node.lat || !node.lon || !node.tags) return;
          const tags = node.tags;
          let name = tags.name || tags['name:en'] || '';
          if (!name) return;

          let category = 'other';
          let displayCategory = 'Other';
          let color = '#94a3b8';

          if (tags.amenity === 'atm' || tags.amenity === 'bank') { category = 'atm'; displayCategory = 'ATM/Bank'; color = '#10b981'; }
          else if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') { category = 'restaurant'; displayCategory = 'Restaurant'; color = '#f59e0b'; }
          else if (tags.amenity === 'cafe') { category = 'cafe'; displayCategory = 'Cafe'; color = '#f59e0b'; }
          else if (tags.shop) { category = 'shopping'; displayCategory = 'Shopping'; color = '#06b6d4'; }
          else if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'pharmacy') { category = 'healthcare'; displayCategory = 'Healthcare'; color = '#ef4444'; }
          else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway) { category = 'transport'; displayCategory = 'Transport'; color = '#6366f1'; }
          else if (tags.leisure === 'park' || tags.leisure === 'playground' || tags.tourism === 'theme_park' || tags.tourism === 'zoo' || tags.leisure === 'water_park') { category = 'family_attraction'; displayCategory = 'Family & Parks'; color = '#84cc16'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'museum' || tags.tourism === 'gallery' || tags.amenity === 'cinema' || tags.amenity === 'theatre' || tags.leisure === 'stadium' || tags.leisure === 'sports_centre') { category = 'entertainment'; displayCategory = 'Entertainment'; color = '#8b5cf6'; }
          else if (tags.amenity === 'place_of_worship') { category = 'religious'; displayCategory = 'Religious'; color = '#a855f7'; }
          
          places.push({ id: node.id, name, lat: node.lat, lon: node.lon, category, displayCategory, color });
        });
        setNearbyPlaces(places);
        sessionStorage.setItem(cacheKey, JSON.stringify(places));
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
`;
code = code.substring(0, fetchStartIndex) + newFetch.trim() + code.substring(fetchEndIndex);

// 2. Update getPlaceScore
const scoreStart = 'const getPlaceScore = (place) => {';
const scoreEnd = 'return score;\n  };';
const scoreStartIndex = code.indexOf(scoreStart);
const scoreEndIndex = code.indexOf(scoreEnd) + scoreEnd.length;

const newScore = `
  const getPlaceScore = (place) => {
    const cat = (place.category || 'other');
    let score = 20; // Default base

    if (tripType === 'family') {
      if (cat === 'family_attraction') score = 100;
      else if (cat === 'restaurant') score = 75;
      else if (cat === 'cafe') score = 70;
      else if (cat === 'shopping') score = 65;
      else if (cat === 'healthcare') score = 60;
      else if (cat === 'atm') score = 55;
      else if (cat === 'transport') score = 50;
      else score = 20;
    } 
    else if (tripType === 'couple') {
      if (cat === 'restaurant') score = 100;
      else if (cat === 'cafe') score = 95;
      else if (cat === 'entertainment') score = 90;
      else if (cat === 'shopping') score = 75;
      else if (cat === 'family_attraction') score = 65;
      else if (cat === 'transport') score = 55;
      else if (cat === 'atm') score = 50;
      else if (cat === 'healthcare') score = 45;
      else score = 20;
    } 
    else if (tripType === 'business') {
      if (cat === 'atm') score = 100;
      else if (cat === 'transport') score = 95;
      else if (cat === 'restaurant') score = 85;
      else if (cat === 'cafe') score = 80;
      else if (cat === 'shopping') score = 70;
      else if (cat === 'healthcare') score = 65;
      else if (cat === 'entertainment') score = 50;
      else if (cat === 'family_attraction') score = 35;
      else score = 20;
    } 
    else if (tripType === 'solo') {
      if (cat === 'restaurant') score = 100;
      else if (cat === 'cafe') score = 95;
      else if (cat === 'entertainment') score = 90;
      else if (cat === 'shopping') score = 85;
      else if (cat === 'transport') score = 80;
      else if (cat === 'healthcare') score = 60;
      else if (cat === 'atm') score = 55;
      else if (cat === 'family_attraction') score = 50;
      else score = 20;
    }

    return score;
  };
`;
code = code.substring(0, scoreStartIndex) + newScore.trim() + code.substring(scoreEndIndex);


// 3. Update PlaceIcon helper to check place.displayCategory (which contains the old category string)
// But wait, the original file doesn't have PlaceIcon! I need to insert it before fetchNearbyPlaces.
const iconHelper = `
  const PlaceIcon = ({ displayCategory, className, color }) => {
    const props = { className, style: { color } };
    if (displayCategory === 'ATM/Bank') return <Banknote {...props} />;
    if (displayCategory === 'Restaurant') return <Utensils {...props} />;
    if (displayCategory === 'Cafe') return <Utensils {...props} />;
    if (displayCategory === 'Shopping') return <ShoppingBag {...props} />;
    if (displayCategory === 'Healthcare') return <HeartPulse {...props} />;
    if (displayCategory === 'Transport') return <Train {...props} />;
    if (displayCategory === 'Family & Parks') return <TreePine {...props} />;
    if (displayCategory === 'Entertainment') return <Ticket {...props} />;
    if (displayCategory === 'Religious') return <Church {...props} />;
    return <MapLucide {...props} />;
  };
`;
// Put it right before getPlaceScore
const getPlaceScoreIndex2 = code.indexOf('const getPlaceScore = (place) => {');
code = code.substring(0, getPlaceScoreIndex2) + iconHelper + '\n' + code.substring(getPlaceScoreIndex2);


// 4. Update the render logic to use displayCategory and not filter by tripType group!
// Match from {/* Nearby Services */} to No landmarks listed.</p>
const uiBlockStart = '{/* Nearby Services */}';
const uiBlockEnd = 'No landmarks listed.</p>\n              )}\n            </div>';
const uiStartIndex = code.indexOf(uiBlockStart);
const uiEndIndex = code.indexOf(uiBlockEnd) + uiBlockEnd.length;

if (uiStartIndex === -1 || uiEndIndex === -1) {
  console.log("UI BLOCK NOT FOUND!", uiStartIndex, uiEndIndex);
  process.exit(1);
}

const newUIBlock = `
            {/* Real Nearby Services & Attractions */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-brand-400" />
                  <span>Nearby Services</span>
                </h4>
                <select 
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1 text-slate-600 dark:text-slate-300 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="family">Family Trip</option>
                  <option value="couple">Couple Trip</option>
                  <option value="business">Business Trip</option>
                  <option value="solo">Solo Trip</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                Nearby services within 3 km &mdash; prioritized for <strong className="capitalize">{tripType}</strong> trips.
              </p>
              
              {isFetchingPlaces ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                  <span className="text-xs font-medium">Scanning surrounding area...</span>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {nearbyPlaces
                    .map(place => ({
                      ...place,
                      distance: getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, place.lat, place.lon),
                      priorityScore: getPlaceScore(place)
                    }))
                    .filter(place => place.distance <= 3) // Strict 3km filter
                    .sort((a, b) => {
                      if (b.priorityScore !== a.priorityScore) {
                        return b.priorityScore - a.priorityScore; // Highest score first
                      }
                      return a.distance - b.distance; // closest first
                    })
                    .slice(0, 15) // Top 15 mixed places based on score
                    .map((place) => (
                      <div key={place.id} className="flex items-start justify-between text-xs group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <PlaceIcon displayCategory={place.displayCategory} color={place.color} className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{place.displayCategory}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium truncate text-[11px]" title={place.name}>{place.name}</span>
                          </div>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                          {place.distance < 1 ? \`\${(place.distance * 1000).toFixed(0)} m\` : \`\${place.distance.toFixed(1)} km\`}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <MapLucide className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {!hotel.latitude || !hotel.longitude 
                      ? "Coordinates missing. Services unavailable." 
                      : "No nearby services found within 3km."}
                  </p>
                </div>
              )}
            </div>
`;
code = code.substring(0, uiStartIndex) + newUIBlock.trim() + code.substring(uiEndIndex);

// 5. Replace Map popups to use displayCategory instead of category
// Make sure MapLucide doesn't break anything. We need to add the imports!
const lucideImportRegex = /import\s+\{\s*Star,/;
code = code.replace(lucideImportRegex, `import { Banknote, Utensils, ShoppingBag, HeartPulse, Train, TreePine, Ticket, Church, Loader2, Navigation, Compass, MapPin as MapLucide, Star,`);

// Also fix the Map section filtering
const mapFilterRegex = /\{\s*nearbyPlaces\.filter\(p => mapFilter === 'all' \|\| p\.group === mapFilter\)\.map\(\(place\) => \{/;
if (mapFilterRegex.test(code)) {
  const newMapFilter = `
{nearbyPlaces.filter(p => mapFilter === 'all' || p.category === mapFilter || (mapFilter === 'attraction' && p.category === 'family_attraction'))
  .filter(p => getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, p.lat, p.lon) <= 3) // Strict 3km filter for map too
  .sort((a,b) => getPlaceScore(b) - getPlaceScore(a) || getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, a.lat, a.lon) - getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, b.lat, b.lon))
  .map((place) => {
`;
  code = code.replace(mapFilterRegex, newMapFilter.trim());
}

// Fix map popups
code = code.split('{place.category}').join('{place.displayCategory}');

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS');
