with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

start_marker = "{([...nearbyPlaces] || [])"
end_marker = "</div>\n                    ))}"

if start_marker in code and end_marker in code:
    start_idx = code.index(start_marker)
    end_idx = code.index(end_marker) + len(end_marker)
    
    new_sidebar = """{Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
                      [...nearbyPlaces].sort((a,b) => getPlaceScore(b) - getPlaceScore(a)).slice(0, 50).map(place => (
                          <div key={place.id} className="p-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                              <strong style={{color: place.color}}>{place.displayCategory}</strong> - <span className="text-slate-700 dark:text-slate-300">{place.name}</span>
                              <div className="text-xs text-slate-500">{Number(place.distanceKm || 0).toFixed(2)} km</div>
                          </div>
                      ))
                  ) : (
                      <div className="text-sm p-2 text-slate-500">No nearby services found within 3km.</div>
                  )}"""
    
    code = code[:start_idx] + new_sidebar + code[end_idx:]
    
    with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SUCCESS")
else:
    print("MARKERS NOT FOUND")
