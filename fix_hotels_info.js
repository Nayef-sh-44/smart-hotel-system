const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const resultsHeaderStr = `{/* Results Header */}`;
if (!content.includes("No active flash offers found")) {
    const newHeader = `{flashOffer && !hasFlashOffers && !loading && hotels.length > 0 && (
              <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 p-3 rounded-lg mb-4 text-sm font-medium border border-brand-100 dark:border-brand-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-500" />
                No active flash offers found. Showing all available hotels.
              </div>
            )}
            
            {/* Results Header */}`;
    content = content.replace(resultsHeaderStr, newHeader);
}

fs.writeFileSync('frontend/src/pages/Hotels.jsx', content, 'utf8');
console.log("Fixed info block");
