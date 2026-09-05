import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the map filter logic
old_filter = r"nearbyPlaces\.filter\(p => mapFilter === 'all' \|\| p\.category === mapFilter \|\| \(mapFilter === 'attraction' && p\.category === 'family_attraction'\)\)"
new_filter = """
nearbyPlaces.filter(p => {
  if (mapFilter === 'all') return true;
  if (mapFilter === 'restaurant') return ['restaurant', 'fast_food', 'cafe'].includes(p.category);
  if (mapFilter === 'shopping') return ['shopping', 'mall', 'supermarket'].includes(p.category);
  if (mapFilter === 'hospital') return ['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(p.category);
  if (mapFilter === 'atm') return ['atm', 'bank'].includes(p.category);
  if (mapFilter === 'attraction') return ['theme_park', 'zoo', 'aquarium', 'museum', 'gallery', 'cinema', 'theatre', 'sports', 'attraction', 'religious', 'park', 'garden', 'playground'].includes(p.category);
  return p.category === mapFilter;
})
""".strip()

code = re.sub(old_filter, new_filter, code)

with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS MAP FILTER")
