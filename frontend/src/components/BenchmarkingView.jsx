import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function BenchmarkingView({ data }) {
  if (!data) return <div className="p-8 text-center text-slate-500">Loading benchmark data...</div>;

  const { myHotel, marketAverage, differences, insights } = data;

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Competitor Benchmarking Report", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Hotel: ${myHotel.name}`, 14, 32);
      doc.text(`City: ${myHotel.city_name}`, 14, 38);
      doc.text(`Category: ${myHotel.star_rating} Stars`, 14, 44);
      doc.text(`Market Sample: ${marketAverage.total_competitors} competitor(s)`, 14, 50);

      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'My Hotel', 'Market Average', 'Difference']],
        body: [
          ['Average Price', `$${myHotel.avg_base_price}`, `$${marketAverage.avg_base_price}`, `${differences.price_difference_amount > 0 ? '+' : ''}$${differences.price_difference_amount} (${differences.price_difference_percentage}%)`],
          ['Occupancy Rate', `${myHotel.occupancy_rate}%`, `${marketAverage.avg_occupancy_rate}%`, `${differences.occupancy_difference > 0 ? '+' : ''}${differences.occupancy_difference}%`],
          ['Guest Rating', `${myHotel.avg_guest_rating} / 5.0`, `${marketAverage.avg_guest_rating} / 5.0`, `${differences.rating_difference > 0 ? '+' : ''}${differences.rating_difference}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });

      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.text("Performance Insights", 14, finalY + 15);
      
      doc.setFontSize(10);
      let yPos = finalY + 22;
      insights.forEach(insight => {
        doc.text(`• ${insight}`, 14, yPos, { maxWidth: 180 });
        yPos += 8;
      });

      doc.save(`Benchmarking_${myHotel.name.replace(/\\s+/g, '_')}.pdf`);
      toast.success("Benchmarking report downloaded.");
    } catch (e) {
      toast.error("Failed to generate PDF.");
    }
  };

  if (marketAverage.total_competitors === 0) {
    return (
      <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Competitor Benchmarking</h3>
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
