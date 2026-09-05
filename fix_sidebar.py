import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

old_sidebar = r"\{\(\[\.\.\.nearbyPlaces\] \|\| \[\]\)[\s\S]*?\s*\.map\(\(place\) => \(\s*<div key=\{place\.id\}[\s\S]*?\s*</div>\s*\)\)\}"

new_sidebar = """
                  {Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
                      nearbyPlaces.slice(0, 50).map(place => (
                          <div key={place.id} className="p-2 border-b text-sm">
                              <strong>{place.displayCategory}</strong> - <span>{place.name}</span>
                              <div className="text-xs text-gray-500">{Number(place.distanceKm || 0).toFixed(2)} km</div>
                          </div>
                      ))
                  ) : (
                      <div className="text-sm p-2">No nearby services found within 3km.</div>
                  )}
"""

# The code currently has:
# {([...nearbyPlaces] || [])
#   .map(...)
#   .filter(...)
#   .sort(...)
#   .map(...)

code = re.sub(r"\{\(\[\.\.\.nearbyPlaces\] \|\| \[\]\).*?</div>\s*\)\)\}", new_sidebar.strip(), code, flags=re.DOTALL)

with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SIDEBAR FIXED")
