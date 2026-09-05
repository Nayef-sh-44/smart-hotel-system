with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

start_marker = "                ) : (nearbyPlaces || []).length > 0 ? ("
end_marker = """                          </span>
                        </div>
                      ))}
                  </div>
                ) : ("""

if start_marker in code and end_marker in code:
    start_idx = code.index(start_marker)
    end_idx = code.index(end_marker) + len(end_marker)
    
    new_sidebar = """                ) : Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {[...nearbyPlaces]
                      .map(place => ({
                        ...place,
                        distance: place.distanceKm || 0,
                        priorityScore: getPlaceScore(place)
                      }))
                      .sort((a, b) => {
                        if (b.priorityScore !== a.priorityScore) {
                          return b.priorityScore - a.priorityScore;
                        }
                        return a.distance - b.distance;
                      })
                      .slice(0, 100)
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
                ) : ("""
    
    code = code[:start_idx] + new_sidebar + code[end_idx:]
    
    with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SUCCESS")
else:
    print("MARKERS NOT FOUND")
