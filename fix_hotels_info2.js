const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const targetStr = "{loading ? (";
if (!content.includes("No active flash offers found")) {
    const newStr = `{flashOffer && !hasFlashOffers && !loading && hotels.length > 0 && (
            <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 p-3 rounded-lg mb-6 text-sm font-medium border border-brand-100 dark:border-brand-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-500" />
              No active flash offers found. Showing all available hotels.
            </div>
          )}

          {loading ? (`;
    content = content.replace(targetStr, newStr);
}

fs.writeFileSync('frontend/src/pages/Hotels.jsx', content, 'utf8');
console.log("Fixed info block 2");
