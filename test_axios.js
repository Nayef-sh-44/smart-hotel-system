const axios = require('axios');
const lat = 24.710217;
const lon = 46.676064;
const q1 = `[out:json][timeout:30];(nwr["amenity"~"atm"](around:3000,${lat},${lon}););out center;`;
axios.post('https://overpass-api.de/api/interpreter', q1, { headers: { 'Content-Type': 'text/plain' } })
.then(r => console.log("DATA:", r.data.elements.length))
.catch(e => console.error("ERROR", e.message));
