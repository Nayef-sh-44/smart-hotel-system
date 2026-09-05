const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const getPlaceScoreFn = `
  const getPlaceScore = (place) => {
    let score = 0;
    const cat = (place.category || '').toLowerCase();
    
    if (cat.includes('atm') || cat.includes('bank')) {
      score += 5; // ATM relevant for all
    }

    if (tripType === 'family') {
      if (cat.includes('park') || cat.includes('playground') || cat.includes('amusement') || cat.includes('attraction')) score += 10;
      if (cat.includes('restaurant') || cat.includes('fast_food')) score += 5;
    } else if (tripType === 'couple') {
      if (cat.includes('restaurant') || cat.includes('cafe')) score += 10;
      if (cat.includes('attraction') || cat.includes('entertainment') || cat.includes('leisure') || cat.includes('viewpoint')) score += 8;
    } else if (tripType === 'business') {
      if (cat.includes('bank') || cat.includes('business')) score += 10;
      if (cat.includes('transport')) score += 8;
      if (cat.includes('restaurant') || cat.includes('cafe')) score += 5;
    } else if (tripType === 'solo') {
      if (cat.includes('cafe') || cat.includes('gym')) score += 10;
      if (cat.includes('restaurant') || cat.includes('transport') || cat.includes('attraction')) score += 5;
    }
    
    return score;
  };
`;

code = code.replace(
  "const [tripType, setTripType] = useState('family');",
  "const [tripType, setTripType] = useState('family');\n" + getPlaceScoreFn
);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
