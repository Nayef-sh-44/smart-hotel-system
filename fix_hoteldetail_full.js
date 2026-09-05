const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Add missing imports to lucide-react specifically
const lucideImportRegex = /import\s+\{([^}]*)\}\s+from\s+'lucide-react';/;
code = code.replace(lucideImportRegex, (match, p1) => {
  return `import { ${p1}, Banknote, Utensils, ShoppingBag, HeartPulse, Train, TreePine, Ticket, Church } from 'lucide-react';`;
});

// 2. Add PlaceIcon component
const iconHelper = `
const PlaceIcon = ({ category, className, color }) => {
  const props = { className, style: { color } };
  if (category === 'ATM') return <Banknote {...props} />;
  if (category === 'Restaurant') return <Utensils {...props} />;
  if (category === 'Shopping') return <ShoppingBag {...props} />;
  if (category === 'Healthcare') return <HeartPulse {...props} />;
  if (category === 'Transport') return <Train {...props} />;
  if (category === 'Family & Parks') return <TreePine {...props} />;
  if (category === 'Entertainment') return <Ticket {...props} />;
  if (category === 'Religious') return <Church {...props} />;
  return <MapLucide {...props} />;
};
`;
const exportIndex = code.indexOf('export default function HotelDetail() {');
code = code.substring(0, exportIndex) + iconHelper + '\n' + code.substring(exportIndex);


// 3. Update getPlaceScore
const getPlaceScoreRegex = /const getPlaceScore = \(place\) => \{[\s\S]*?return score;\s*\};/;
const newScore = `
  const getPlaceScore = (place) => {
    let score = 0;
    const cat = (place.category || '').toLowerCase();
    
    // ATM is important for all, but lower than primary trip interests
    if (cat.includes('atm')) {
      score += 40; 
    }

    if (tripType === 'family') {
      if (cat.includes('family') || cat.includes('park')) score += 100;
      if (cat.includes('restaurant')) score += 80;
      if (cat.includes('shopping')) score += 70;
      if (cat.includes('healthcare')) score += 60;
    } else if (tripType === 'couple') {
      if (cat.includes('restaurant')) score += 100;
      if (cat.includes('entertainment')) score += 90;
      if (cat.includes('family') || cat.includes('park')) score += 80;
    } else if (tripType === 'business') {
      if (cat.includes('atm')) score += 60; // Extra boost for business
      if (cat.includes('restaurant')) score += 90;
      if (cat.includes('transport')) score += 80;
      if (cat.includes('healthcare')) score += 70;
      if (cat.includes('shopping')) score += 60;
    } else if (tripType === 'solo') {
      if (cat.includes('restaurant')) score += 100;
      if (cat.includes('transport')) score += 90;
      if (cat.includes('shopping')) score += 80;
      if (cat.includes('entertainment')) score += 70;
      if (cat.includes('healthcare')) score += 60;
    }
    
    // Default fallback
    if (score === 0) {
      if (cat.includes('shopping')) score += 20;
      if (cat.includes('healthcare')) score += 10;
    }

    return score;
  };
`;
code = code.replace(getPlaceScoreRegex, newScore.trim());

// 4. Update fetchNearbyPlaces
const fetchRegex = /const fetchNearbyPlaces = async \(lat, lon\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\s*\}\s*\};/;
const newFetch = `
  const fetchNearbyPlaces = async (lat, lon) => {
    setIsFetchingPlaces(true);
    setNearbyPlaces([]);
    try {
      // 3KM Radius
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
      out body 80;\`;

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

          let category = 'Other';
          let group = 'other';
          let color = '#94a3b8';

          if (tags.amenity === 'atm' || tags.amenity === 'bank') { category = 'ATM'; group = 'atm'; color = '#10b981'; }
          else if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'cafe') { category = 'Restaurant'; group = 'restaurant'; color = '#f59e0b'; }
          else if (tags.shop) { category = 'Shopping'; group = 'shopping'; color = '#06b6d4'; }
          else if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'pharmacy') { category = 'Healthcare'; group = 'hospital'; color = '#ef4444'; }
          else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway) { category = 'Transport'; group = 'transport'; color = '#6366f1'; }
          else if (tags.leisure === 'park' || tags.leisure === 'playground' || tags.tourism === 'theme_park' || tags.tourism === 'zoo' || tags.leisure === 'water_park') { category = 'Family & Parks'; group = 'family'; color = '#84cc16'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'museum' || tags.tourism === 'gallery' || tags.amenity === 'cinema' || tags.amenity === 'theatre' || tags.leisure === 'stadium' || tags.leisure === 'sports_centre') { category = 'Entertainment'; group = 'entertainment'; color = '#8b5cf6'; }
          else if (tags.amenity === 'place_of_worship') { category = 'Religious'; group = 'religious'; color = '#a855f7'; }
          
          places.push({ id: node.id, name, lat: node.lat, lon: node.lon, category, group, color });
        });
        setNearbyPlaces(places);
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
`;
code = code.replace(fetchRegex, newFetch.trim());

// 5. Replace Right Col Nearby Services
const rightColStart = '{/* Nearby Services */}';
const rightColEnd = 'No landmarks listed.</p>\n              )}\n            </div>';
const startIndex = code.indexOf(rightColStart);
const endIndex = code.indexOf(rightColEnd) + rightColEnd.length;

const newBlock = `
            {/* Real Nearby Services & Attractions */}
            <div className="glass-panel p-6">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-brand-400" />
                <span>Nearby Services (Real-time)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                Prioritized for <strong>{tripType}</strong> travelers. Within 3km radius.
              </p>
              
              {isFetchingPlaces ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                  <span className="text-xs">Scanning surrounding area...</span>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {nearbyPlaces
                    .map(place => ({
                      ...place,
                      distance: getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, place.lat, place.lon)
                    }))
                    .filter(place => place.distance <= 3) // Strict 3km filter
                    .sort((a, b) => {
                      const scoreA = getPlaceScore(a);
                      const scoreB = getPlaceScore(b);
                      if (scoreA !== scoreB) return scoreB - scoreA;
                      return a.distance - b.distance; // If same score, closest first
                    })
                    .slice(0, 15) // Top 15 results
                    .map((place) => (
                      <div key={place.id} className="flex items-start justify-between text-xs group">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <PlaceIcon category={place.category} color={place.color} className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate" title={place.name}>{place.category}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium truncate text-[11px]">{place.name}</span>
                          </div>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {place.distance < 1 ? \`\${(place.distance * 1000).toFixed(0)} m\` : \`\${place.distance.toFixed(1)} km\`}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {!hotel.latitude || !hotel.longitude 
                      ? "Nearby services unavailable for this hotel (Missing coordinates)." 
                      : "No nearby services found within 3km."}
                  </p>
                </div>
              )}
            </div>
`;
code = code.substring(0, startIndex) + newBlock.trim() + code.substring(endIndex);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS');
