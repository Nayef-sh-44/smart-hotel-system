import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Replace fetchNearbyPlaces
old_fetch = r"const fetchNearbyPlaces = async \(\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\s*\}\s*\};"
new_fetch = """
  const fetchNearbyPlaces = async () => {
    if (!id) return;
    setIsFetchingPlaces(true);
    try {
      const response = await hotelService.getNearbyServices(id);
      const services =
        response?.data?.success &&
        Array.isArray(response.data.data)
          ? response.data.data
          : [];
      setNearbyPlaces(services);
      console.log('[Nearby Services]', 'hotel:', id, 'count:', services.length);
    } catch (error) {
      console.error('[Nearby Services] failed:', error);
      setNearbyPlaces([]);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
"""
code = re.sub(old_fetch, new_fetch.strip(), code)


# 2. Fix map marker rendering: limit to 100, ensure valid numbers.
# Locate the map markers code
old_map = r"\{nearbyPlaces\.filter\(p => \{[\s\S]*?\}\s*\)\s*\.filter\(p => p\.distanceKm <= 3\)\s*// Strict 3km filter for map too\s*\.map\(\(place\) => \{[\s\S]*?\}\)\s*\}"

new_map = """
                {([...nearbyPlaces] || [])
                  .filter(p => {
                    if (mapFilter === 'all') return true;
                    if (mapFilter === 'restaurant') return ['restaurant', 'fast_food', 'cafe'].includes(p.category);
                    if (mapFilter === 'shopping') return ['shopping', 'mall', 'supermarket'].includes(p.category);
                    if (mapFilter === 'hospital') return ['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(p.category);
                    if (mapFilter === 'atm') return ['atm', 'bank'].includes(p.category);
                    if (mapFilter === 'attraction') return ['theme_park', 'zoo', 'aquarium', 'museum', 'gallery', 'cinema', 'theatre', 'sports', 'attraction', 'religious', 'park', 'garden', 'playground'].includes(p.category);
                    return p.category === mapFilter;
                  })
                  .filter(p => p.distanceKm <= 3) // Strict 3km filter for map
                  .filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)))
                  .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
                  .slice(0, 100)
                  .map((place) => {
                    const dist = place.distanceKm || 0;
                    return (
                      <CircleMarker
                        key={`poi-${place.id}`}
                        center={[Number(place.latitude), Number(place.longitude)]}
                        radius={7}
                        pathOptions={{
                          color: '#ffffff',
                          weight: 2,
                          fillColor: place.color,
                          fillOpacity: 0.9,
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="text-slate-800 font-sans p-1 min-w-[160px]">
                            <h3 className="font-bold text-sm mb-1" style={{color: '#1e3a8a'}}>{place.name}</h3>
                            <div className="mt-1 text-xs text-slate-600 space-y-1">
                              <div><strong>Category:</strong> <span className="px-2 py-0.5 rounded text-white font-semibold text-[10px]" style={{backgroundColor: place.color}}>{place.displayCategory}</span></div>
                              <div><strong>Distance:</strong> {dist.toFixed(2)} km</div>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
"""
code = re.sub(old_map, new_map.strip(), code)

# 3. Add safety checks to the sidebar list so dist doesn't crash on undefined.
old_sidebar_map = r"\{nearbyPlaces\s*\.map\(place => \(\{\s*\.\.\.place,\s*distance: place\.distanceKm,\s*priorityScore: getPlaceScore\(place\)\s*\}\)\)\s*\.filter\(place => place\.distance <= 3\)\s*// Strict 3km filter\s*\.sort\(\(a, b\) => \{[\s\S]*?\}\s*\)\s*\.map\(\(place\) => \([\s\S]*?\}\)\)}"

new_sidebar_map = """
                  {([...nearbyPlaces] || [])
                    .map(place => ({
                      ...place,
                      distance: place.distanceKm || 0,
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
                            <span className="text-slate-500 dark:text-slate-400 truncate">{place.name}</span>
                          </div>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                          {place.distance < 1 ? `${(place.distance * 1000).toFixed(0)} m` : `${place.distance.toFixed(1)} km`}
                        </span>
                      </div>
                    ))}
"""
code = re.sub(old_sidebar_map, new_sidebar_map.strip(), code)

# 4. Check if nearbyPlaces is being safely guarded in the render tree.
code = code.replace("nearbyPlaces.length > 0 ?", "(nearbyPlaces || []).length > 0 ?")

with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS")
