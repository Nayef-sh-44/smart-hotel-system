const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const regex = /const getPlaceScore = \(place\) => \{[\s\S]*?return score;\s*\};/;

const newScore = `
  const getPlaceScore = (place) => {
    let score = 0;
    const cat = (place.category || '').toLowerCase();
    
    // ATM is important for all, but lower than primary trip interests
    if (cat.includes('atm')) {
      score += 40; 
    }

    if (tripType === 'family') {
      if (cat.includes('family') || cat.includes('park')) score += 100;
      if (cat.includes('restaurant')) score += 80;
      if (cat.includes('shopping')) score += 70;
      if (cat.includes('healthcare')) score += 60;
    } else if (tripType === 'couple') {
      if (cat.includes('restaurant')) score += 100;
      if (cat.includes('entertainment')) score += 90;
      if (cat.includes('family') || cat.includes('park')) score += 80;
    } else if (tripType === 'business') {
      if (cat.includes('atm')) score += 60; // Extra boost for business
      if (cat.includes('restaurant')) score += 90;
      if (cat.includes('transport')) score += 80;
      if (cat.includes('healthcare')) score += 70;
      if (cat.includes('shopping')) score += 60;
    } else if (tripType === 'solo') {
      if (cat.includes('restaurant')) score += 100;
      if (cat.includes('transport')) score += 90;
      if (cat.includes('shopping')) score += 80;
      if (cat.includes('entertainment')) score += 70;
      if (cat.includes('healthcare')) score += 60;
    }
    
    // Default fallback
    if (score === 0) {
      if (cat.includes('shopping')) score += 20;
      if (cat.includes('healthcare')) score += 10;
    }

    return score;
  };
`;

if(regex.test(code)) {
  code = code.replace(regex, newScore.trim());
  fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
  console.log('SUCCESS 2');
} else {
  console.log('REGEX FAILED');
}
