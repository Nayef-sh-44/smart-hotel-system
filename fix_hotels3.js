const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const searchButtonCode = `
            {/* FINAL SEARCH BUTTON */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="w-full sm:w-2/3 md:w-1/2 bg-brand-600 hover:bg-brand-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-6 h-6" /> Search
              </button>
            </div>
`;

const newSearchButtonCode = `
            {/* FINAL SEARCH BUTTON */}
            <div className="flex justify-center pt-8 mt-8 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="submit"
                className="w-full sm:w-2/3 md:w-1/2 bg-brand-600 hover:bg-brand-700 text-white py-4 px-8 rounded-xl shadow-xl shadow-brand-500/20 dark:shadow-brand-900/20 font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-6 h-6" /> Search
              </button>
            </div>
`;

code = code.replace(searchButtonCode, newSearchButtonCode);
fs.writeFileSync('frontend/src/pages/Hotels.jsx', code);
console.log('SUCCESS');
