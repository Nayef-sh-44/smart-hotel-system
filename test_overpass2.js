const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const q = `[out:json][timeout:30];nwr["amenity"~"atm"](around:3000,24.71,46.67);out center;`;

(async () => {
  for (const url of endpoints) {
    try {
      console.log("Trying", url);
      const start = Date.now();
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'SmartHotel-Backend/1.0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: q
      });
      console.log(url, res.status, "Time:", Date.now() - start, "ms");
      if (res.ok) {
        console.log("Success! Returning");
        return;
      }
    } catch (e) {
      console.log(url, "Error:", e.message);
    }
  }
})();
