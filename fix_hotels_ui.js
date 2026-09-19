const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

// Replace Filters UI block
const regex = /<h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase\s+tracking-wider">Filters<\/h3>/g;
const newUI = `<div className="flex justify-between items-center mb-4">
  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Filters</h3>
  <label className="flex items-center gap-2 cursor-pointer group">
    <input 
      type="checkbox" 
      className="form-checkbox h-4 w-4 text-brand-600 dark:text-brand-400 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-900 focus:ring-brand-500 transition-colors"
      checked={flashOffer}
      onChange={(e) => setFlashOffer(e.target.checked)}
    />
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
      <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
      Flash Offers
    </span>
  </label>
</div>`;

content = content.replace(regex, newUI);

// Replace Results Header Info Block
const resultsRegex = /\{\/\* Results Header \*\/\}\s+<div className="flex justify-between items-center mb-6">/g;
const newResults = `{flashOffer && !hasFlashOffers && !loading && hotels.length > 0 && (
  <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 p-3 rounded-lg mb-4 text-sm font-medium border border-brand-100 dark:border-brand-800 flex items-center gap-2">
    <Info className="w-5 h-5 text-brand-500" />
    No active flash offers found. Showing all available hotels.
  </div>
)}
{/* Results Header */}
<div className="flex justify-between items-center mb-6">`;

content = content.replace(resultsRegex, newResults);

// Add state if not present (sometimes regex fails on previous patch)
if(!content.includes("const [flashOffer")) {
    content = content.replace("const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');", 
    `const [flashOffer, setFlashOffer] = useState(searchParams.get('flash_offer') === 'true');
  const [hasFlashOffers, setHasFlashOffers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');`);
}

// Add dependency
content = content.replace(/selectedCity, starFilter, targetPrice, selectedAmenities, tripType\]\);/g, "selectedCity, starFilter, targetPrice, selectedAmenities, tripType, flashOffer]);");

// Add Zap to lucide-react if missing
if(!content.includes("Zap,")) {
    content = content.replace("Award } from 'lucide-react'", "Award, Zap, Info } from 'lucide-react'");
}

fs.writeFileSync('frontend/src/pages/Hotels.jsx', content, 'utf8');
console.log("Fixed UI blocks");
