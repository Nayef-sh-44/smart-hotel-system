import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace fetchNearbyPlaces completely to correctly handle the intercepted Axios response
old_fetch = r"const fetchNearbyPlaces = async \(\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\s*\}\s*\};"
new_fetch = """
  const fetchNearbyPlaces = async () => {
    if (!id) return;
    setIsFetchingPlaces(true);
    try {
      const response = await hotelService.getNearbyServices(id);
      
      console.log('[NEARBY DEBUG] API response:', response);
      
      // The Axios interceptor in api.js returns response.data directly!
      // So response is `{ success: true, data: [...] }`
      const services = response?.success && Array.isArray(response?.data)
          ? response.data
          : [];
          
      console.log('[NEARBY DEBUG] count:', services.length, 'first:', services[0]);
      
      setNearbyPlaces(services);
    } catch (error) {
      console.error('[NEARBY DEBUG] failed:', error);
      setNearbyPlaces([]);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
"""
code = re.sub(old_fetch, new_fetch.strip(), code)

# Ensure mapPlaces logic is defined
if "const mapPlaces" not in code:
    old_map_start = r"\{mapFilter === 'all' \? 'bg-brand-600"
    new_map_start = """
  const mapPlaces = Array.isArray(nearbyPlaces)
      ? [...nearbyPlaces]
          .filter(place =>
              Number.isFinite(Number(place.latitude)) &&
              Number.isFinite(Number(place.longitude))
          )
          .sort((a, b) =>
              Number(a.distanceKm || 0) -
              Number(b.distanceKm || 0)
          )
          .slice(0, 100)
      : [];
      
  {mapFilter === 'all' ? 'bg-brand-600
"""
    # Just insert it before the map container
    code = code.replace("<MapContainer", """
              {/* Calculate Map Places strictly for map markers */}
              {(() => {
                const mapPlaces = Array.isArray(nearbyPlaces)
                  ? [...nearbyPlaces]
                      .filter(place =>
                          Number.isFinite(Number(place.latitude)) &&
                          Number.isFinite(Number(place.longitude))
                      )
                      .sort((a, b) =>
                          Number(a.distanceKm || 0) -
                          Number(b.distanceKm || 0)
                      )
                      .slice(0, 100)
                  : [];
                
                return (
                  <MapContainer
""")
    code = code.replace("</MapContainer>", "</MapContainer>\n                );\n              })()}")

# Let's clean up the map markers mapping logic
old_map_logic = r"\{\(\[\.\.\.nearbyPlaces\] \|\| \[\]\)\s*\.filter\(p => \{[\s\S]*?\}\s*\)\s*\.filter\(p => p\.distanceKm <= 3\)\s*// Strict 3km filter for map\s*\.filter\(p => Number\.isFinite\(Number\(p\.latitude\)\) && Number\.isFinite\(Number\(p\.longitude\)\)\)\s*\.sort\(\(a, b\) => \(a\.distanceKm \|\| 0\) - \(b\.distanceKm \|\| 0\)\)\s*\.slice\(0, 100\)\s*\.map\(\(place\) => \{[\s\S]*?\}\)\}"

new_map_logic = """
                  {mapPlaces.map((place) => {
                    const dist = place.distanceKm || 0;
                    return (
                      <CircleMarker
                        key={`nearby-${place.id}`}
                        center={[Number(place.latitude), Number(place.longitude)]}
                        radius={7}
                        pathOptions={{
                          color: '#ffffff',
                          weight: 2,
                          fillColor: place.color || '#2563eb',
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
code = re.sub(old_map_logic, new_map_logic.strip(), code)


with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)
print("UPDATED")
