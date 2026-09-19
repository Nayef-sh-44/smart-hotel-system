const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const fetchBlockRegex = /setHotels\(fetchedHotels\);/g;

if (!content.includes("hasActiveFlash")) {
    const newFetchBlock = `
        let hasActiveFlash = false;
        if (flashOffer) {
          const hasFlashDeals = (h) => h.flashDeals && h.flashDeals.length > 0;
          hasActiveFlash = fetchedHotels.some(hasFlashDeals);
          
          fetchedHotels.sort((a, b) => {
            const aHas = hasFlashDeals(a);
            const bHas = hasFlashDeals(b);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
          });
        }
        
        setHasFlashOffers(hasActiveFlash);
        setHotels(fetchedHotels);`;
        
    content = content.replace("setHotels(fetchedHotels);", newFetchBlock);
}

// Ensure URL param updates
if(!content.includes("urlParams.set('flash_offer'")) {
    content = content.replace("if (checkOutDate) urlParams.set('checkOut', checkOutDate);", 
        "if (checkOutDate) urlParams.set('checkOut', checkOutDate);\n        if (flashOffer) urlParams.set('flash_offer', 'true');");
}

fs.writeFileSync('frontend/src/pages/Hotels.jsx', content, 'utf8');
console.log("Fixed Sorting logic");
