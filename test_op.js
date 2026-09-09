const q = `[out:json][timeout:25];
(
  nwr["shop"](around:3000,40.7128,-74.0060);
);
out center qt;`;

const start = Date.now();
fetch('https://lz4.overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'User-Agent': 'SmartHotel-Backend/1.0',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  body: "data=" + encodeURIComponent(q),
})
.then(r => r.json())
.then(d => {
  console.log("Shop Elements:", d.elements.length, "Time:", Date.now() - start);
})
.catch(console.error);
