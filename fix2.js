const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const oldScoreStart = 'const getPlaceScore = (place) => {';
const oldScoreEnd = 'return score;\n  };';

const start = code.indexOf(oldScoreStart);
const end = code.indexOf(oldScoreEnd) + oldScoreEnd.length;

if (start === -1 || end === -1) process.exit(1);

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

code = code.substring(0, start) + newScore.trim() + code.substring(end);
fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('SUCCESS 2');
