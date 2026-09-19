import re

with open("frontend/src/pages/Hotels.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Zap icon
if "Zap" not in content:
    content = content.replace("Search, MapPin, Sparkles, Hotel as HotelIcon, Award", "Search, MapPin, Sparkles, Hotel as HotelIcon, Award, Zap, Info")

# 2. Add flashOffer state
state_block = """  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');"""
new_state_block = """  // Search state
  const [flashOffer, setFlashOffer] = useState(searchParams.get('flash_offer') === 'true');
  const [hasFlashOffers, setHasFlashOffers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');"""
content = content.replace(state_block, new_state_block)

# 3. Add to useEffect dependencies
dep_block = """    }, [selectedCity, starFilter, targetPrice, selectedAmenities, tripType]);"""
new_dep_block = """    }, [selectedCity, starFilter, targetPrice, selectedAmenities, tripType, flashOffer]);"""
content = content.replace(dep_block, new_dep_block)

# 4. Add to fetchHotels
fetch_block = """        if (checkInDate) urlParams.set('checkIn', checkInDate);
        if (checkOutDate) urlParams.set('checkOut', checkOutDate);
        setSearchParams(urlParams, { replace: true });

        const res = await hotelService.getAll(params);"""

new_fetch_block = """        if (checkInDate) urlParams.set('checkIn', checkInDate);
        if (checkOutDate) urlParams.set('checkOut', checkOutDate);
        if (flashOffer) urlParams.set('flash_offer', 'true');
        setSearchParams(urlParams, { replace: true });

        const res = await hotelService.getAll(params);"""

content = content.replace(fetch_block, new_fetch_block)

sort_block = """        if (Array.isArray(res)) {
          fetchedHotels = res;
        } else if (res?.success) {
          fetchedHotels = res.data;
        }
        setHotels(fetchedHotels);"""

new_sort_block = """        if (Array.isArray(res)) {
          fetchedHotels = res;
        } else if (res?.success) {
          fetchedHotels = res.data;
        }

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
        setHotels(fetchedHotels);"""
content = content.replace(sort_block, new_sort_block)

# 5. Add UI checkbox in Filters section
ui_block = """              {/* FILTER SECTION */}
              <div className="glass-panel p-5 animate-in fade-in duration-200 border border-slate-200 
dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase 
tracking-wider">Filters</h3>"""
new_ui_block = """              {/* FILTER SECTION */}
              <div className="glass-panel p-5 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
                <div className="flex justify-between items-center mb-4">
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
                </div>"""
content = content.replace(ui_block, new_ui_block)

# Fix possible line break issues
content = content.replace("border-slate-200 \ndark:border-slate-800", "border-slate-200 dark:border-slate-800")
content = content.replace("uppercase \ntracking-wider", "uppercase tracking-wider")

content = content.replace("""              {/* FILTER SECTION */}
              <div className="glass-panel p-5 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-900/60 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Filters</h3>""", new_ui_block)

# 6. Add Info message above hotels list
list_block = """          {/* Main Results Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">"""

new_list_block = """          {/* Main Results Content */}
          <div className="lg:col-span-3">
            {flashOffer && !hasFlashOffers && !loading && hotels.length > 0 && (
              <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 p-3 rounded-lg mb-4 text-sm font-medium border border-brand-100 dark:border-brand-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-500" />
                No active flash offers found. Showing all available hotels.
              </div>
            )}
            
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">"""

content = content.replace(list_block, new_list_block)

with open("frontend/src/pages/Hotels.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched Hotels.jsx")
