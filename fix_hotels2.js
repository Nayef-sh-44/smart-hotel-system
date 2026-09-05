const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Hotels.jsx', 'utf8');

const searchButtonCode = `
              {/* Centered Search Button in a separate row */}
              <div className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                <button
                  type="submit"
                  className="w-full sm:w-2/3 md:w-1/2 bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" /> Search
                </button>
              </div>
`;

// Remove the button from Trip Details section
code = code.replace(searchButtonCode, '\n');

// Find the end of the form tag
const formEndIndex = code.indexOf('</form>');

// Insert the search button before the closing form tag, with a new wrapper for separation
const newSearchButtonCode = `
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

code = code.substring(0, formEndIndex) + newSearchButtonCode + code.substring(formEndIndex);

fs.writeFileSync('frontend/src/pages/Hotels.jsx', code);
console.log('SUCCESS');
