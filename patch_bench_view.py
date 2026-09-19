import re

with open('frontend/src/components/BenchmarkingView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = '''import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { managerService } from '../services/api.js';
'''
content = re.sub(r'import React.*?\n.*?toast.*?;\n', imports, content, flags=re.DOTALL)

# Modify Component
old_comp = '''export default function BenchmarkingView({ data }) {
  if (!data) return <div className="p-8 text-center text-slate-500">Loading benchmark data...</div>;

  const { myHotel, marketAverage, differences, insights } = data;'''

new_comp = '''export default function BenchmarkingView({ data: initialData }) {
  const [data, setData] = useState(initialData);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && !data) setData(initialData);
  }, [initialData]);

  const handleApplyFilter = async (presetStart, presetEnd) => {
    const s = presetStart || startDate;
    const e = presetEnd || endDate;
    if (!s || !e) {
        toast.error('Please select both start and end dates.');
        return;
    }
    setLoading(true);
    try {
      const res = await managerService.getCompetitorBenchmarking({ start_date: s, end_date: e });
      if (res.success) {
        setData(res.data);
        if (presetStart && presetEnd) {
          setStartDate(s);
          setEndDate(e);
        }
        toast.success('Benchmarking updated for selected period.');
      }
    } catch (err) {
      toast.error('Failed to fetch benchmarking data.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (type) => {
    const year = new Date().getFullYear();
    let s, e;
    if (type === 'summer') {
      s = ${year}-06-01;
      e = ${year}-08-31;
    } else if (type === 'winter') {
      s = ${year}-12-01;
      e = ${year+1}-02-28;
    }
    handleApplyFilter(s, e);
  };

  if (!data) return <div className="p-8 text-center text-slate-500">Loading benchmark data...</div>;

  const { period, myHotel, marketAverage, differences, insights } = data;
'''

content = content.replace(old_comp, new_comp)

# Add Date UI
old_ui = '''  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Competitor Benchmarking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compare your performance against local competitors</p>
        </div>'''

new_ui = '''  return (
    <div className="space-y-6">
      
      {/* Date Range Filter UI */}
      <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field w-full text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field w-full text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleApplyFilter()} disabled={loading} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50">
              {loading ? 'Applying...' : 'Apply'}
            </button>
            <button onClick={() => applyPreset('summer')} disabled={loading} className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              Summer
            </button>
            <button onClick={() => applyPreset('winter')} disabled={loading} className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              Winter
            </button>
          </div>
        </div>
        {period && (
          <p className="text-xs text-brand-600 dark:text-brand-400 mt-3 font-semibold">
            Currently viewing benchmarking for period: {period.start_date} to {period.end_date}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Competitor Benchmarking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compare your performance against local competitors</p>
        </div>'''

content = content.replace(old_ui, new_ui)

with open('frontend/src/components/BenchmarkingView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("BenchmarkingView patched!")
