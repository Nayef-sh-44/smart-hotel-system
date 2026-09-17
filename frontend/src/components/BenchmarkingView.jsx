import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { managerService } from '../services/api.js';

export default function BenchmarkingView({ data: initialData }) {
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
    if (new Date(e) <= new Date(s)) {
        toast.error('End date must be after start date.');
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

  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (type) => {
    setActivePreset(type === "summer" ? "Summer" : "Winter");
    const year = new Date().getFullYear();
    let s, e;
    if (type === 'summer') {
      s = `${year}-06-01`;
      e = `${year}-08-31`;
    } else if (type === 'winter') {
      s = `${year}-12-01`;
      e = `${year+1}-02-28`;
    }
    handleApplyFilter(s, e);
  };

  if (!data) return <div className="p-8 text-center text-slate-500">Loading benchmark data...</div>;

  const { period, myHotel, marketAverage, differences, insights } = data;


  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // 1. REPORT HEADER
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138); // HotelLink blue
      doc.text("HotelLink", 14, yPos);
      yPos += 10;
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Competitor Benchmarking Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`My Hotel: ${myHotel.name}`, 14, yPos);
      yPos += 6;
      doc.text(`Comparison Period:`, 14, yPos);
      yPos += 6;
      doc.text(`  From: ${period?.start_date || 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`  To: ${period?.end_date || 'N/A'}`, 14, yPos);
      yPos += 10;

      // 2. PERIOD / SEASON
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Period / Season", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      yPos += 8;
      doc.text(`Comparison Period: ${period?.start_date || 'N/A'} -> ${period?.end_date || 'N/A'}`, 14, yPos);
      if (activePreset) {
        yPos += 6;
        doc.text(`Season: ${activePreset}`, 14, yPos);
      }
      yPos += 12;

      // 3. PERFORMANCE SUMMARY
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance Summary", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      yPos += 8;

      // Average Price
      doc.setFont('helvetica', 'bold');
      doc.text("Average Price", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: $${myHotel.avg_base_price}`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: $${marketAverage.avg_base_price}`, 14, yPos);
      yPos += 5;
      const priceDiffStr = differences.price_difference_amount > 0 ? `+$${differences.price_difference_amount}` : `-$${Math.abs(differences.price_difference_amount)}`;
      doc.text(`Difference: ${priceDiffStr}`, 14, yPos);
      yPos += 8;

      // Occupancy Rate
      doc.setFont('helvetica', 'bold');
      doc.text("Occupancy Rate", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: ${myHotel.occupancy_rate}%`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: ${marketAverage.avg_occupancy_rate}%`, 14, yPos);
      yPos += 5;
      const occDiffStr = differences.occupancy_difference > 0 ? `+${differences.occupancy_difference}%` : `${differences.occupancy_difference}%`;
      doc.text(`Difference: ${occDiffStr}`, 14, yPos);
      yPos += 8;

      // Guest Rating
      doc.setFont('helvetica', 'bold');
      doc.text("Guest Rating", 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      doc.text(`My Hotel: ${myHotel.avg_guest_rating}`, 14, yPos);
      yPos += 5;
      doc.text(`Market Average: ${marketAverage.avg_guest_rating}`, 14, yPos);
      yPos += 5;
      const ratDiffStr = differences.rating_difference > 0 ? `+${differences.rating_difference}` : `${differences.rating_difference}`;
      doc.text(`Difference: ${ratDiffStr}`, 14, yPos);
      yPos += 12;

      // 4. PERFORMANCE VS MARKET TABLE
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance vs Market Table", 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'My Hotel', 'Market Avg', 'Difference']],
        body: [
          ['Average Price', `$${myHotel.avg_base_price}`, `$${marketAverage.avg_base_price}`, `${priceDiffStr} (${differences.price_difference_percentage > 0 ? '+' : ''}${differences.price_difference_percentage}%)`],
          ['Occupancy Rate', `${myHotel.occupancy_rate}%`, `${marketAverage.avg_occupancy_rate}%`, occDiffStr],
          ['Guest Rating', `${myHotel.avg_guest_rating} / 5.0`, `${marketAverage.avg_guest_rating} / 5.0`, ratDiffStr]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });

      const finalY = doc.lastAutoTable.finalY || yPos + 30;
      
      // 5. PERFORMANCE INSIGHTS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Performance Insights", 14, finalY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      let insightY = finalY + 24;
      insights.forEach(insight => {
        const splitText = doc.splitTextToSize(`- ${insight}`, 180);
        doc.text(splitText, 14, insightY);
        insightY += (splitText.length * 6) + 4;
      });

      doc.save(`Benchmarking_${myHotel.name.replace(/\s+/g, '_')}.pdf`);
      toast.success("Benchmarking report downloaded.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
  };

  if (marketAverage.total_competitors === 0) {
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

        <h3 className="text-xl font-bold text-slate-900">Competitor Benchmarking</h3>
        <p className="text-slate-500 mb-6">Compare your hotel's performance with the local market average.</p>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
          <p className="font-semibold">Insufficient market data for benchmarking.</p>
          <p className="text-sm mt-1">There are currently no other {myHotel.star_rating}-star hotels in {myHotel.city_name} to compare against.</p>
        </div>
      </div>
    );
  }

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Competitor Benchmarking</h3>
          <p className="text-sm text-slate-500">Compare your hotel's performance with the local market average.</p>
        </div>
        <button onClick={handleExportPDF} className="btn-primary text-xs flex items-center gap-2">
          <Download className="w-4 h-4" /> Benchmarking Report PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Price Card */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Average Price</h4>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">${myHotel.avg_base_price}</p>
              <p className="text-xs text-slate-500 mt-1">Market: ${marketAverage.avg_base_price}</p>
            </div>
            <div className={`text-sm font-bold ${differences.price_difference_percentage > 0 ? 'text-emerald-600' : differences.price_difference_percentage < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {differences.price_difference_percentage > 0 ? '+' : ''}{differences.price_difference_percentage}%
            </div>
          </div>
        </div>

        {/* Occupancy Card */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Occupancy Rate</h4>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{myHotel.occupancy_rate}%</p>
              <p className="text-xs text-slate-500 mt-1">Market: {marketAverage.avg_occupancy_rate}%</p>
            </div>
            <div className={`text-sm font-bold ${differences.occupancy_difference > 0 ? 'text-emerald-600' : differences.occupancy_difference < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {differences.occupancy_difference > 0 ? '+' : ''}{differences.occupancy_difference}%
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Guest Rating</h4>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{myHotel.avg_guest_rating}</p>
              <p className="text-xs text-slate-500 mt-1">Market: {marketAverage.avg_guest_rating}</p>
            </div>
            <div className={`text-sm font-bold ${differences.rating_difference > 0 ? 'text-emerald-600' : differences.rating_difference < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {differences.rating_difference > 0 ? '+' : ''}{differences.rating_difference}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Performance vs Market</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-2 font-semibold text-slate-700">Metric</th>
                  <th className="py-3 px-2 font-semibold text-slate-700">My Hotel</th>
                  <th className="py-3 px-2 font-semibold text-slate-700">Market Avg</th>
                  <th className="py-3 px-2 font-semibold text-slate-700 text-right">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2 font-medium text-slate-900">Average Price</td>
                  <td className="py-3 px-2">${myHotel.avg_base_price}</td>
                  <td className="py-3 px-2">${marketAverage.avg_base_price}</td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-700">
                    {differences.price_difference_amount > 0 ? '+' : ''}${differences.price_difference_amount}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-slate-900">Occupancy Rate</td>
                  <td className="py-3 px-2">{myHotel.occupancy_rate}%</td>
                  <td className="py-3 px-2">{marketAverage.avg_occupancy_rate}%</td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-700">
                    {differences.occupancy_difference > 0 ? '+' : ''}{differences.occupancy_difference}%
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-slate-900">Guest Rating</td>
                  <td className="py-3 px-2">{myHotel.avg_guest_rating}</td>
                  <td className="py-3 px-2">{marketAverage.avg_guest_rating}</td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-700">
                    {differences.rating_difference > 0 ? '+' : ''}{differences.rating_difference}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Performance Insights</h4>
          <ul className="space-y-4">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
