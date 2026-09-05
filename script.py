import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Replace getPlaceScore and PlaceIcon
# Let's find the boundaries.
score_icon_regex = r"const getPlaceScore = \(place\) => \{.*?(?=const fetchNearbyPlaces =)"
# wait, fetchNearbyPlaces might have stuff between them. Let's do it safer.

new_score_icon = """
  const getPlaceScore = (place) => {
    const cat = (place.category || 'other');
    let score = 20;

    if (tripType === 'family') {
      if (['theme_park', 'water_park', 'zoo'].includes(cat)) score = 100;
      else if (cat === 'playground') score = 95;
      else if (['park', 'garden', 'aquarium'].includes(cat)) score = 90;
      else if (['restaurant', 'fast_food'].includes(cat)) score = 75;
      else if (cat === 'cafe') score = 70;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 65;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 60;
      else if (['atm', 'bank'].includes(cat)) score = 55;
      else if (['transport'].includes(cat)) score = 50;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 50;
      else score = 20;
    } 
    else if (tripType === 'couple') {
      if (['restaurant', 'fast_food'].includes(cat)) score = 100;
      else if (cat === 'cafe') score = 95;
      else if (['cinema', 'theatre', 'museum'].includes(cat)) score = 90;
      else if (['gallery', 'attraction'].includes(cat)) score = 85;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 75;
      else if (['park', 'garden'].includes(cat)) score = 70;
      else if (['transport'].includes(cat)) score = 55;
      else if (['atm', 'bank'].includes(cat)) score = 50;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 45;
      else score = 20;
    } 
    else if (tripType === 'business') {
      if (['atm', 'bank'].includes(cat)) score = 100;
      else if (['transport'].includes(cat)) score = 95;
      else if (['restaurant', 'fast_food'].includes(cat)) score = 85;
      else if (cat === 'cafe') score = 80;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 70;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 65;
      else if (cat === 'parking') score = 65;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 50;
      else if (['park', 'garden'].includes(cat)) score = 35;
      else if (['theme_park', 'water_park', 'zoo', 'playground', 'aquarium'].includes(cat)) score = 30;
      else score = 20;
    } 
    else if (tripType === 'solo') {
      if (['restaurant', 'fast_food'].includes(cat)) score = 100;
      else if (cat === 'cafe') score = 95;
      else if (['entertainment', 'cinema', 'theatre', 'museum', 'gallery', 'sports'].includes(cat)) score = 90;
      else if (['shopping', 'mall', 'supermarket'].includes(cat)) score = 85;
      else if (['transport'].includes(cat)) score = 80;
      else if (['attraction'].includes(cat)) score = 75;
      else if (['hospital', 'clinic', 'pharmacy', 'healthcare'].includes(cat)) score = 60;
      else if (['atm', 'bank'].includes(cat)) score = 55;
      else if (['park', 'garden'].includes(cat)) score = 50;
      else score = 20;
    }
    return score;
  };

  const PlaceIcon = ({ displayCategory, className, color }) => {
    const props = { className, style: { color } };
    if (displayCategory.includes('ATM') || displayCategory.includes('Bank')) return <Banknote {...props} />;
    if (displayCategory.includes('Restaurant') || displayCategory.includes('Food') || displayCategory.includes('Cafe')) return <Utensils {...props} />;
    if (displayCategory.includes('Shopping') || displayCategory.includes('Mall') || displayCategory.includes('Supermarket')) return <ShoppingBag {...props} />;
    if (displayCategory.includes('Healthcare') || displayCategory.includes('Hospital') || displayCategory.includes('Pharmacy') || displayCategory.includes('Clinic')) return <HeartPulse {...props} />;
    if (displayCategory.includes('Transport') || displayCategory.includes('Parking')) return <Train {...props} />;
    if (displayCategory.includes('Park') || displayCategory.includes('Garden') || displayCategory.includes('Zoo') || displayCategory.includes('Playground') || displayCategory.includes('Aquarium')) return <TreePine {...props} />;
    if (displayCategory.includes('Entertainment') || displayCategory.includes('Cinema') || displayCategory.includes('Museum') || displayCategory.includes('Theatre') || displayCategory.includes('Sports')) return <Ticket {...props} />;
    if (displayCategory.includes('Religious')) return <Church {...props} />;
    return <MapLucide {...props} />;
  };
"""

code = re.sub(r"const getPlaceScore = \(place\) => \{.*?(?=const fetchNearbyPlaces =)", new_score_icon, code, flags=re.DOTALL)

# 2. Replace fetchNearbyPlaces
new_fetch = """
  const fetchNearbyPlaces = async (lat, lon) => {
    const cacheKey = `overpass_v3_${id}_${lat}_${lon}`;
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

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      const data = await res.json();
      
      console.log("Overpass raw elements:", data.elements?.length || 0);
      
      if (data && data.elements) {
        const places = [];
        const seen = new Set();
        
        data.elements.forEach(element => {
          const placeLat = element.lat ?? element.center?.lat;
          const placeLon = element.lon ?? element.center?.lon;
          
          if (typeof placeLat !== 'number' || typeof placeLon !== 'number') return;
          if (!element.tags) return;
          
          const tags = element.tags;
          let name = tags.name || tags['name:en'] || '';
          if (!name) return;

          const uid = element.type + element.id;
          if (seen.has(uid)) return;
          seen.add(uid);

          let category = 'other';
          let displayCategory = 'Other';
          let color = '#94a3b8';

          if (tags.amenity === 'atm') { category = 'atm'; displayCategory = 'ATM'; color = '#10b981'; }
          else if (tags.amenity === 'bank') { category = 'bank'; displayCategory = 'Bank'; color = '#10b981'; }
          else if (tags.amenity === 'restaurant') { category = 'restaurant'; displayCategory = 'Restaurant'; color = '#f59e0b'; }
          else if (tags.amenity === 'fast_food') { category = 'fast_food'; displayCategory = 'Fast Food'; color = '#f59e0b'; }
          else if (tags.amenity === 'cafe' || tags.amenity === 'bar' || tags.amenity === 'pub') { category = 'cafe'; displayCategory = 'Cafe/Bar'; color = '#f59e0b'; }
          else if (tags.shop === 'supermarket' || tags.shop === 'convenience') { category = 'supermarket'; displayCategory = 'Supermarket'; color = '#06b6d4'; }
          else if (tags.shop === 'mall' || tags.shop === 'department_store') { category = 'mall'; displayCategory = 'Shopping Mall'; color = '#06b6d4'; }
          else if (tags.shop) { category = 'shopping'; displayCategory = 'Shopping'; color = '#06b6d4'; }
          else if (tags.amenity === 'hospital') { category = 'hospital'; displayCategory = 'Hospital'; color = '#ef4444'; }
          else if (tags.amenity === 'clinic' || tags.amenity === 'doctors') { category = 'clinic'; displayCategory = 'Clinic'; color = '#ef4444'; }
          else if (tags.amenity === 'pharmacy') { category = 'pharmacy'; displayCategory = 'Pharmacy'; color = '#ef4444'; }
          else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway || tags.highway === 'bus_stop') { category = 'transport'; displayCategory = 'Transport'; color = '#6366f1'; }
          else if (tags.amenity === 'parking') { category = 'parking'; displayCategory = 'Parking'; color = '#94a3b8'; }
          else if (tags.leisure === 'park') { category = 'park'; displayCategory = 'Park'; color = '#84cc16'; }
          else if (tags.leisure === 'garden') { category = 'garden'; displayCategory = 'Garden'; color = '#84cc16'; }
          else if (tags.leisure === 'playground') { category = 'playground'; displayCategory = 'Playground'; color = '#84cc16'; }
          else if (tags.tourism === 'theme_park' || tags.leisure === 'water_park' || tags.tourism === 'amusement_park') { category = 'theme_park'; displayCategory = 'Theme Park'; color = '#ec4899'; }
          else if (tags.tourism === 'zoo') { category = 'zoo'; displayCategory = 'Zoo'; color = '#ec4899'; }
          else if (tags.tourism === 'aquarium') { category = 'aquarium'; displayCategory = 'Aquarium'; color = '#ec4899'; }
          else if (tags.tourism === 'museum') { category = 'museum'; displayCategory = 'Museum'; color = '#8b5cf6'; }
          else if (tags.tourism === 'gallery') { category = 'gallery'; displayCategory = 'Gallery'; color = '#8b5cf6'; }
          else if (tags.amenity === 'cinema') { category = 'cinema'; displayCategory = 'Cinema'; color = '#8b5cf6'; }
          else if (tags.amenity === 'theatre') { category = 'theatre'; displayCategory = 'Theatre'; color = '#8b5cf6'; }
          else if (tags.leisure === 'sports_centre' || tags.leisure === 'stadium') { category = 'sports'; displayCategory = 'Sports Centre'; color = '#8b5cf6'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') { category = 'attraction'; displayCategory = 'Attraction'; color = '#ec4899'; }
          else if (tags.amenity === 'place_of_worship') { category = 'religious'; displayCategory = 'Religious Place'; color = '#a855f7'; }
          
          places.push({ id: uid, name, lat: placeLat, lon: placeLon, category, displayCategory, color });
        });
        
        console.log("Parsed nearby places:", places.length);
        console.table(
          places.reduce((acc, place) => {
            acc[place.category] = (acc[place.category] || 0) + 1;
            return acc;
          }, {})
        );

        setNearbyPlaces(places);
        sessionStorage.setItem(cacheKey, JSON.stringify(places));
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };
"""

code = re.sub(r"const fetchNearbyPlaces = async \(lat, lon\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\s*\}\s*\};", new_fetch.strip(), code)

# 3. Remove .slice(0, 15) and update Map filter map
code = code.replace(".slice(0, 15) // Top 15 mixed places based on score", "")
# if there's any other slice, let's just do a generic removal of that specific line part:
code = code.replace(".slice(0, 15)", "")

with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS UI UPDATE")
