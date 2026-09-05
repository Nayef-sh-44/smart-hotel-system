import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Imports
lucide_import_regex = r"import \{\s*(.*?)\s*\} from 'lucide-react';"
lucide_match = re.search(lucide_import_regex, code)
if lucide_match:
    imports = lucide_match.group(1).replace("\n", " ")
    # Add new icons if not present
    new_icons = ["Banknote", "Utensils", "ShoppingBag", "HeartPulse", "Train", "TreePine", "Ticket", "Church", "Navigation", "MapPin as MapLucide"]
    existing_imports = [i.strip() for i in imports.split(",")]
    for icon in new_icons:
        if icon not in existing_imports and icon.split(' as ')[0] not in existing_imports:
            existing_imports.append(icon)
    code = code.replace(lucide_match.group(0), f"import {{ {', '.join(existing_imports)} }} from 'lucide-react';")

# 2. Add tripType state
code = code.replace("const [mapFilter, setMapFilter] = useState('all');", "const [mapFilter, setMapFilter] = useState('all');\n  const [tripType, setTripType] = useState('family');")

# 3. Add getPlaceScore & PlaceIcon right before fetchNearbyPlaces
score_icon = """
  const getPlaceScore = (place) => {
    const cat = (place.category || 'other');
    let score = 20;

    if (tripType === 'family') {
      if (['theme_park', 'water_park', 'zoo'].includes(cat)) score = 100;
      else if (cat === 'playground') score = 95;
      else if (['park', 'garden', 'aquarium'].includes(cat)) score = 90;
      else if (['restaurant', 'fast_food'].includes(cat)) score = 75;
      else if (cat === 'cafe') score = 70;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 65;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 60;
      else if (['atm', 'bank'].includes(cat)) score = 55;
      else if (['transport'].includes(cat)) score = 50;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 50;
      else score = 20;
    } 
    else if (tripType === 'couple') {
      if (['restaurant', 'fast_food'].includes(cat)) score = 100;
      else if (cat === 'cafe') score = 95;
      else if (['cinema', 'theatre', 'museum'].includes(cat)) score = 90;
      else if (['gallery', 'attraction'].includes(cat)) score = 85;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 75;
      else if (['park', 'garden'].includes(cat)) score = 70;
      else if (['transport'].includes(cat)) score = 55;
      else if (['atm', 'bank'].includes(cat)) score = 50;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 45;
      else score = 20;
    } 
    else if (tripType === 'business') {
      if (['atm', 'bank'].includes(cat)) score = 100;
      else if (['transport'].includes(cat)) score = 95;
      else if (['restaurant', 'fast_food'].includes(cat)) score = 85;
      else if (cat === 'cafe') score = 80;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 70;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 65;
      else if (cat === 'parking') score = 65;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 50;
      else if (['park', 'garden'].includes(cat)) score = 35;
      else if (['theme_park', 'water_park', 'zoo', 'playground', 'aquarium'].includes(cat)) score = 30;
      else score = 20;
    } 
    else if (tripType === 'solo') {
      if (['restaurant', 'fast_food'].includes(cat)) score = 100;
      else if (cat === 'cafe') score = 95;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 90;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 85;
      else if (['transport'].includes(cat)) score = 80;
      else if (['attraction'].includes(cat)) score = 75;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 60;
      else if (['atm', 'bank'].includes(cat)) score = 55;
      else if (['park', 'garden'].includes(cat)) score = 50;
      else score = 20;
    }
    return score;
  };

  const PlaceIcon = ({ displayCategory, className, color }) => {
    const props = { className, style: { color } };
    if (!displayCategory) return <MapLucide {...props} />;
    if (displayCategory.includes('ATM') || displayCategory.includes('Bank')) return <Banknote {...props} />;
    if (displayCategory.includes('Restaurant') || displayCategory.includes('Food') || displayCategory.includes('Cafe')) return <Utensils {...props} />;
    if (displayCategory.includes('Shopping') || displayCategory.includes('Mall') || displayCategory.includes('Supermarket')) return <ShoppingBag {...props} />;
    if (displayCategory.includes('Healthcare') || displayCategory.includes('Hospital') || displayCategory.includes('Pharmacy') || displayCategory.includes('Clinic')) return <HeartPulse {...props} />;
    if (displayCategory.includes('Transport') || displayCategory.includes('Parking')) return <Train {...props} />;
    if (displayCategory.includes('Park') || displayCategory.includes('Garden') || displayCategory.includes('Zoo') || displayCategory.includes('Playground') || displayCategory.includes('Aquarium')) return <TreePine {...props} />;
    if (displayCategory.includes('Entertainment') || displayCategory.includes('Cinema') || displayCategory.includes('Museum') || displayCategory.includes('Theatre') || displayCategory.includes('Sports')) return <Ticket {...props} />;
    if (displayCategory.includes('Religious')) return <Church {...props} />;
    return <MapLucide {...props} />;
  };

"""
code = code.replace("const fetchNearbyPlaces = async (lat, lon) => {", score_icon + "  const fetchNearbyPlaces = async (lat, lon) => {")

# 4. Replace fetchNearbyPlaces
fetch_regex = r"const fetchNearbyPlaces = async \(lat, lon\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\s*\}\s*\};"
new_fetch = """
  const fetchNearbyPlaces = async (lat, lon) => {
    const cacheKey = `overpass_v3_${id}_${lat}_${lon}`;
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
      const overpassQuery = `[out:json][timeout:30];
      (
        nwr["amenity"~"atm|bank|restaurant|fast_food|cafe|bar|pub|hospital|clinic|doctors|pharmacy|dentist|bus_station|cinema|theatre|place_of_worship"](around:3000,${lat},${lon});
        nwr["shop"](around:3000,${lat},${lon});
        nwr["leisure"~"park|playground|water_park|swimming_pool|stadium|sports_centre|garden"](around:3000,${lat},${lon});
        nwr["tourism"~"theme_park|zoo|attraction|museum|gallery|aquarium|viewpoint|hotel"](around:3000,${lat},${lon});
        nwr["public_transport"](around:3000,${lat},${lon});
        nwr["railway"~"station|halt"](around:3000,${lat},${lon});
        nwr["aeroway"~"aerodrome"](around:3000,${lat},${lon});
        nwr["highway"~"bus_stop"](around:3000,${lat},${lon});
      );
      out center;`;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      const data = await res.json();
      
      console.log("Overpass raw elements:", data.elements?.length || 0);
      
      if (data && data.elements) {
        const places = [];
        const seen = new Set();
        
        data.elements.forEach(element => {
          const placeLat = element.lat ?? element.center?.lat;
          const placeLon = element.lon ?? element.center?.lon;
          
          if (typeof placeLat !== 'number' || typeof placeLon !== 'number') return;
          if (!element.tags) return;
          
          const tags = element.tags;
          let name = tags.name || tags['name:en'] || '';
          if (!name) return;

          const uid = element.type + element.id;
          if (seen.has(uid)) return;
          seen.add(uid);

          let category = 'other';
          let displayCategory = 'Other';
          let color = '#94a3b8';

          if (tags.amenity === 'atm') { category = 'atm'; displayCategory = 'ATM'; color = '#10b981'; }
          else if (tags.amenity === 'bank') { category = 'bank'; displayCategory = 'Bank'; color = '#10b981'; }
          else if (tags.amenity === 'restaurant') { category = 'restaurant'; displayCategory = 'Restaurant'; color = '#f59e0b'; }
          else if (tags.amenity === 'fast_food') { category = 'fast_food'; displayCategory = 'Fast Food'; color = '#f59e0b'; }
          else if (tags.amenity === 'cafe' || tags.amenity === 'bar' || tags.amenity === 'pub') { category = 'cafe'; displayCategory = 'Cafe/Bar'; color = '#f59e0b'; }
          else if (tags.shop === 'supermarket' || tags.shop === 'convenience') { category = 'supermarket'; displayCategory = 'Supermarket'; color = '#06b6d4'; }
          else if (tags.shop === 'mall' || tags.shop === 'department_store') { category = 'mall'; displayCategory = 'Shopping Mall'; color = '#06b6d4'; }
          else if (tags.shop) { category = 'shopping'; displayCategory = 'Shopping'; color = '#06b6d4'; }
          else if (tags.amenity === 'hospital') { category = 'hospital'; displayCategory = 'Hospital'; color = '#ef4444'; }
          else if (tags.amenity === 'clinic' || tags.amenity === 'doctors') { category = 'clinic'; displayCategory = 'Clinic'; color = '#ef4444'; }
          else if (tags.amenity === 'pharmacy') { category = 'pharmacy'; displayCategory = 'Pharmacy'; color = '#ef4444'; }
          else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway || tags.highway === 'bus_stop') { category = 'transport'; displayCategory = 'Transport'; color = '#6366f1'; }
          else if (tags.amenity === 'parking') { category = 'parking'; displayCategory = 'Parking'; color = '#94a3b8'; }
          else if (tags.leisure === 'park') { category = 'park'; displayCategory = 'Park'; color = '#84cc16'; }
          else if (tags.leisure === 'garden') { category = 'garden'; displayCategory = 'Garden'; color = '#84cc16'; }
          else if (tags.leisure === 'playground') { category = 'playground'; displayCategory = 'Playground'; color = '#84cc16'; }
          else if (tags.tourism === 'theme_park' || tags.leisure === 'water_park' || tags.tourism === 'amusement_park') { category = 'theme_park'; displayCategory = 'Theme Park'; color = '#ec4899'; }
          else if (tags.tourism === 'zoo') { category = 'zoo'; displayCategory = 'Zoo'; color = '#ec4899'; }
          else if (tags.tourism === 'aquarium') { category = 'aquarium'; displayCategory = 'Aquarium'; color = '#ec4899'; }
          else if (tags.tourism === 'museum') { category = 'museum'; displayCategory = 'Museum'; color = '#8b5cf6'; }
          else if (tags.tourism === 'gallery') { category = 'gallery'; displayCategory = 'Gallery'; color = '#8b5cf6'; }
          else if (tags.amenity === 'cinema') { category = 'cinema'; displayCategory = 'Cinema'; color = '#8b5cf6'; }
          else if (tags.amenity === 'theatre') { category = 'theatre'; displayCategory = 'Theatre'; color = '#8b5cf6'; }
          else if (tags.leisure === 'sports_centre' || tags.leisure === 'stadium') { category = 'sports'; displayCategory = 'Sports Centre'; color = '#8b5cf6'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') { category = 'attraction'; displayCategory = 'Attraction'; color = '#ec4899'; }
          else if (tags.amenity === 'place_of_worship') { category = 'religious'; displayCategory = 'Religious Place'; color = '#a855f7'; }
          
          places.push({ id: uid, name, lat: placeLat, lon: placeLon, category, displayCategory, color });
        });
        
        console.log("Parsed nearby places:", places.length);
        console.table(
          places.reduce((acc, place) => {
            acc[place.category] = (acc[place.category] || 0) + 1;
            return acc;
          }, {})
        );

        setNearbyPlaces(places);
        sessionStorage.setItem(cacheKey, JSON.stringify(places));
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
"""
code = re.sub(fetch_regex, new_fetch.strip(), code)

# 5. Replace right column UI
ui_regex = r"\{\/\*\s*Nearby Services\s*\*\/\}.*?No nearby services listed\.<\/p>\s*\)\}\s*<\/div>"
new_ui = """
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
                          {place.distance < 1 ? `${(place.distance * 1000).toFixed(0)} m` : `${place.distance.toFixed(1)} km`}
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
"""
code = re.sub(ui_regex, new_ui.strip(), code, flags=re.DOTALL)

# 6. Map Filter mapping
old_map_filter = r"\{\s*nearbyPlaces\.filter\(p => mapFilter === 'all' \|\| p\.group === mapFilter\)\.map\(\(place\) => \{"
new_map_filter = """
{nearbyPlaces.filter(p => {
  if (mapFilter === 'all') return true;
  if (mapFilter === 'restaurant') return ['restaurant', 'fast_food', 'cafe'].includes(p.category);
  if (mapFilter === 'shopping') return ['shopping', 'mall', 'supermarket'].includes(p.category);
  if (mapFilter === 'hospital') return ['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(p.category);
  if (mapFilter === 'atm') return ['atm', 'bank'].includes(p.category);
  if (mapFilter === 'attraction') return ['theme_park', 'zoo', 'aquarium', 'museum', 'gallery', 'cinema', 'theatre', 'sports', 'attraction', 'religious', 'park', 'garden', 'playground'].includes(p.category);
  return p.category === mapFilter;
})
  .filter(p => getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, p.lat, p.lon) <= 3) // Strict 3km filter for map too
  .map((place) => {
"""
code = re.sub(old_map_filter, new_map_filter.strip(), code)

# 7. Map popup text change
code = code.replace("{place.category}", "{place.displayCategory}")

with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS REBUILD")
