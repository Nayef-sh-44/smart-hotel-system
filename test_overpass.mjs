const lat = 36.202832;
const lon = 37.153658;
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

const start = Date.now();
fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: 'data=' + encodeURIComponent(overpassQuery)
})
  .then(res => res.text())
  .then(data => console.log('Took: ' + (Date.now() - start) + 'ms. Elements: ' + data.substring(0, 500)))
  .catch(console.error);
