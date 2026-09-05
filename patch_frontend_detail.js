const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Add states for pricePreview, priceLoading, and tripType
code = code.replace(`const [mapFilter, setMapFilter] = useState('all');`,
`const [mapFilter, setMapFilter] = useState('all');
  const [pricePreview, setPricePreview] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [tripType, setTripType] = useState('family');`);

// 2. Add effect to fetch price preview
code = code.replace(`useEffect(() => {
    fetchHotel();
    fetchFavoriteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);`,
`useEffect(() => {
    fetchHotel();
    fetchFavoriteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (selectedRoomId && checkInDate && checkOutDate) {
      const fetchPreview = async () => {
        setIsPriceLoading(true);
        try {
          const res = await fetch(\`http://localhost:5000/api/hotels/\${id}/price-preview?room_id=\${selectedRoomId}&check_in_date=\${checkInDate}&check_out_date=\${checkOutDate}&num_rooms=1\`);
          const data = await res.json();
          if (data.success) {
            setPricePreview(data.data);
          }
        } catch(e) {
          console.error(e);
        } finally {
          setIsPriceLoading(false);
        }
      };
      fetchPreview();
    }
  }, [selectedRoomId, checkInDate, checkOutDate, id]);`);

// 3. Update TripType sorting in nearbyPlaces rendering
// We need to score places based on tripType
const tripScores = `
  const getPlaceScore = (place) => {
    let score = 0;
    const type = place.tags?.amenity || place.tags?.tourism || place.tags?.shop || '';
    if (type === 'atm' || type === 'bank') score += 100; // ATM suitable for all
    if (tripType === 'family') {
      if (type.includes('park') || type.includes('attraction')) score += 50;
      if (type.includes('restaurant')) score += 30;
    } else if (tripType === 'business') {
      if (type.includes('bank') || type.includes('atm')) score += 50;
      if (type.includes('restaurant')) score += 30;
    } else if (tripType === 'couple') {
      if (type.includes('restaurant') || type.includes('cafe')) score += 50;
      if (type.includes('attraction')) score += 40;
    } else if (tripType === 'solo') {
      if (type.includes('cafe') || type.includes('bar') || type.includes('restaurant')) score += 50;
    }
    return score;
  };
`;

code = code.replace(`const dist = getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, place.lat, place.lon);
                  return (`,
`${tripScores}
                  const dist = getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, place.lat, place.lon);
                  return (`);

code = code.replace(`{nearbyPlaces.filter(p => mapFilter === 'all' || p.group === mapFilter).map((place) => {`,
`{nearbyPlaces.filter(p => mapFilter === 'all' || p.group === mapFilter)
  .filter(p => getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, p.lat, p.lon) <= 3) // Max 3km
  .sort((a,b) => getPlaceScore(b) - getPlaceScore(a)) // Sort by TripType
  .map((place) => {`);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('patched');
