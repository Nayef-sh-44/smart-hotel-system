import urllib.request
import urllib.parse
import json

lat = 24.710217
lon = 46.676064

query = f"""[out:json][timeout:30];
(
  nwr["amenity"~"atm|bank|restaurant|fast_food|cafe|bar|pub|hospital|clinic|doctors|pharmacy|dentist|bus_station|cinema|theatre|place_of_worship"](around:3000,{lat},{lon});
  nwr["shop"](around:3000,{lat},{lon});
  nwr["leisure"~"park|playground|water_park|swimming_pool|stadium|sports_centre|garden"](around:3000,{lat},{lon});
  nwr["tourism"~"theme_park|zoo|attraction|museum|gallery|aquarium|viewpoint|hotel"](around:3000,{lat},{lon});
  nwr["public_transport"](around:3000,{lat},{lon});
  nwr["railway"~"station|halt"](around:3000,{lat},{lon});
  nwr["aeroway"~"aerodrome"](around:3000,{lat},{lon});
  nwr["highway"~"bus_stop"](around:3000,{lat},{lon});
);
out center;"""

data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"Elements: {len(result.get('elements', []))}")
except Exception as e:
    print(f"Error: {e}")
