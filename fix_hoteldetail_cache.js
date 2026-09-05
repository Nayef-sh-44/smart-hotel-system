const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const fetchRegex = /const fetchNearbyPlaces = async \(lat, lon\) => \{([\s\S]*?)setIsFetchingPlaces\(false\);\s*\}\s*\};/;

const newFetch = `
  const fetchNearbyPlaces = async (lat, lon) => {
    const cacheKey = \`overpass_\${lat}_\${lon}\`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setNearbyPlaces(JSON.parse(cached));
        return;
      } catch (e) {}
    }

    setIsFetchingPlaces(true);
    setNearbyPlaces([]);
    try {
      const overpassQuery = \`[out:json][timeout:15];
      (
        node["amenity"~"atm|bank|restaurant|fast_food|cafe|hospital|clinic|pharmacy|bus_station|cinema|theatre|place_of_worship"](around:3000,\${lat},\${lon});
        node["shop"~"supermarket|mall|convenience"](around:3000,\${lat},\${lon});
        node["public_transport"~"station"](around:3000,\${lat},\${lon});
        node["railway"~"station"](around:3000,\${lat},\${lon});
        node["aeroway"~"aerodrome"](around:3000,\${lat},\${lon});
        node["leisure"~"park|playground|water_park|swimming_pool|stadium|sports_centre"](around:3000,\${lat},\${lon});
        node["tourism"~"theme_park|zoo|attraction|museum|gallery|information"](around:3000,\${lat},\${lon});
      );
      out body 80;\`;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      const data = await res.json();
      
      if (data && data.elements) {
        const places = [];
        data.elements.forEach(node => {
          if (!node.lat || !node.lon || !node.tags) return;
          const tags = node.tags;
          let name = tags.name || tags['name:en'] || '';
          if (!name) return;

          let category = 'Other';
          let group = 'other';
          let color = '#94a3b8';

          if (tags.amenity === 'atm' || tags.amenity === 'bank') { category = 'ATM'; group = 'atm'; color = '#10b981'; }
          else if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'cafe') { category = 'Restaurant'; group = 'restaurant'; color = '#f59e0b'; }
          else if (tags.shop) { category = 'Shopping'; group = 'shopping'; color = '#06b6d4'; }
          else if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'pharmacy') { category = 'Healthcare'; group = 'hospital'; color = '#ef4444'; }
          else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway) { category = 'Transport'; group = 'transport'; color = '#6366f1'; }
          else if (tags.leisure === 'park' || tags.leisure === 'playground' || tags.tourism === 'theme_park' || tags.tourism === 'zoo' || tags.leisure === 'water_park') { category = 'Family & Parks'; group = 'family'; color = '#84cc16'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'museum' || tags.tourism === 'gallery' || tags.amenity === 'cinema' || tags.amenity === 'theatre' || tags.leisure === 'stadium' || tags.leisure === 'sports_centre') { category = 'Entertainment'; group = 'entertainment'; color = '#8b5cf6'; }
          else if (tags.amenity === 'place_of_worship') { category = 'Religious'; group = 'religious'; color = '#a855f7'; }
          
          places.push({ id: node.id, name, lat: node.lat, lon: node.lon, category, group, color });
        });
        setNearbyPlaces(places);
        sessionStorage.setItem(cacheKey, JSON.stringify(places));
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
`;
code = code.replace(fetchRegex, newFetch.trim());
fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS CACHE');
