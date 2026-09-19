import re

with open("frontend/src/components/BenchmarkingView.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_return = """  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Competitor Benchmarking</h3>"""

new_return = """  return (
    <div className="space-y-6">
      
      {/* Date Range Filter UI */}
      <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Comparison Period</h4>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => { setStartDate(e.target.value); setActivePreset(null); }} 
              className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" 
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => { setEndDate(e.target.value); setActivePreset(null); }} 
              className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleApplyFilter()} 
              disabled={loading} 
              className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
            <button 
              onClick={() => applyPreset('summer')} 
              disabled={loading} 
              className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-xl text-sm font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition"
            >
              Summer Season
            </button>
            <button 
              onClick={() => applyPreset('winter')} 
              disabled={loading} 
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
            >
              Winter Season
            </button>
          </div>
        </div>
        {period && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold">
              Comparison Period: {period.start_date} &rarr; {period.end_date}
              {activePreset && ` | Season: ${activePreset}`}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Competitor Benchmarking</h3>"""

if old_return in content:
    content = content.replace(old_return, new_return)
    print("Main return patched.")
else:
    print("Main return NOT found.")

old_early_return = """  if (marketAverage.total_competitors === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Competitor Benchmarking</h3>"""

new_early_return = """  if (marketAverage.total_competitors === 0) {
    return (
      <div className="space-y-6">
        {/* Date Range Filter UI */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Comparison Period</h4>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => { setStartDate(e.target.value); setActivePreset(null); }} 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => { setEndDate(e.target.value); setActivePreset(null); }} 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleApplyFilter()} 
                disabled={loading} 
                className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50"
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
              <button 
                onClick={() => applyPreset('summer')} 
                disabled={loading} 
                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-xl text-sm font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition"
              >
                Summer Season
              </button>
              <button 
                onClick={() => applyPreset('winter')} 
                disabled={loading} 
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                Winter Season
              </button>
            </div>
          </div>
          {period && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold">
                Comparison Period: {period.start_date} &rarr; {period.end_date}
                {activePreset && ` | Season: ${activePreset}`}
              </p>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900">Competitor Benchmarking</h3>"""

if old_early_return in content:
    content = content.replace(old_early_return, new_early_return)
    print("Early return patched.")
else:
    print("Early return NOT found.")

with open("frontend/src/components/BenchmarkingView.jsx", "w", encoding="utf-8") as f:
    f.write(content)

