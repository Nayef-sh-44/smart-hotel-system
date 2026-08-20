import React, { useState, useEffect } from 'react';
import { useComparison } from '../context/ComparisonContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { comparisonService } from '../services/api.js';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import {
  Scale,
  X,
  Check,
  Star,
  MapPin,
  BookmarkPlus,
  ArrowLeft,
  DollarSign,
  Award,
  Sparkles,
  HelpCircle,
  Download,
} from 'lucide-react';

export default function Compare() {
  const { selectedHotels, removeHotel, clearComparison } = useComparison();
  const { isAuthenticated } = useAuth();
  const { symbol, formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Save Comparison Modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComparisonMatrix = async () => {
    if (selectedHotels.length < 2) {
      setComparisonData(null);
      return;
    }
    setLoading(true);
    try {
      const ids = selectedHotels.map((h) => h.id);
      const res = await comparisonService.getSideBySide(ids);
      if (res.success) {
        setComparisonData(res.data);
      }
    } catch (err) {
      toast.error('Failed to generate comparison matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonMatrix();
  }, [selectedHotels]);

  const handleExportPDF = () => {
    const element = document.getElementById('comparison-matrix');
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     'smart-hotel-comparison.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save comparison lists.');
      return;
    }
    setSaving(true);
    try {
      const ids = selectedHotels.map((h) => h.id);
      const res = await comparisonService.saveComparison(listTitle || 'My Hotel Comparison', ids);
      if (res.success) {
        toast.success('Comparison list saved to your account!');
        setSaveModalOpen(false);
        setListTitle('');
      }
    } catch (err) {
      toast.error(err.error?.message || 'Could not save comparison list.');
    } finally {
      setSaving(false);
    }
  };

  if (selectedHotels.length < 2) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center glass-panel p-8">
          <Scale className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Hotels to Compare</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Please select at least 2 hotels (up to 4) from our explore page to view a side-by-side amenity and pricing matrix.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <span>Explore Hotels</span>
          </Link>
        </div>
      </div>
    );
  }

  const { hotels = [], amenityMatrix = [] } = comparisonData || {};

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="pt-10 pb-8 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Side-by-Side Analysis</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Luxury Hotel Comparison Matrix</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="btn-secondary text-xs"
            >
              <BookmarkPlus className="w-4 h-4 text-brand-400" />
              <span>Save Comparison</span>
            </button>
            <button
              onClick={clearComparison}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 overflow-x-auto">
        {loading ? (
          <div className="glass-panel p-10 text-center text-slate-500 dark:text-slate-400 animate-pulse">
            Generating side-by-side comparison matrix...
          </div>
        ) : !comparisonData ? (
          <div className="text-center py-12 text-slate-400">No comparison data available.</div>
        ) : (
          <div id="comparison-matrix" className="min-w-[768px] space-y-10 bg-white dark:bg-dark-950 p-4 rounded-xl">
            {/* Top Hotel Header Row */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-1 p-4 flex flex-col justify-end font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Comparing ({hotels.length} Hotels)
              </div>
              {hotels.map((h) => (
                <div key={h.id} className="col-span-1 glass-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{Number(h.star_rating).toFixed(1)}</span>
                      </div>
                      <button
                        onClick={() => removeHotel(h.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link
                      to={`/hotels/${h.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1 mb-1"
                    >
                      {h.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{h.city}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">From</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{symbol}{formatPrice(h.base_price_per_night)}</p>
                    </div>
                    <Link
                      to={`/hotels/${h.id}`}
                      className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white text-xs font-semibold transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Ratings Breakdown Section */}
            <div className="glass-panel p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Guest Rating Breakdown</span>
              </h3>

              <div className="space-y-4">
                {['overall', 'cleanliness', 'location', 'service', 'value'].map((metric) => (
                  <div
                    key={metric}
                    className="grid grid-cols-5 gap-4 items-center py-2.5 border-b border-slate-200 dark:border-slate-800/60 last:border-0"
                  >
                    <div className="col-span-1 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {metric} Rating
                    </div>
                    {hotels.map((h) => {
                      const val = h.ratings ? h.ratings[metric] : 0;
                      return (
                        <div key={h.id} className="col-span-1 flex items-center gap-2">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-brand-500 to-amber-400 h-full"
                              style={{ width: `${(val / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">{val} / 5</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenity Availability Matrix */}
            <div className="glass-panel p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Amenities & Services Matrix</span>
              </h3>

              <div className="space-y-3">
                {amenityMatrix.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 gap-4 items-center py-2 border-b border-slate-200 dark:border-slate-800/60 last:border-0 text-xs"
                  >
                    <div className="col-span-1 font-medium text-slate-700 dark:text-slate-200">{item.name}</div>
                    {hotels.map((h) => {
                      const avail = item.hotelAvailability[h.id];
                      return (
                        <div key={h.id} className="col-span-1">
                          {avail && avail.available ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                              <Check className="w-3.5 h-3.5" />
                              <span>{avail.is_free ? 'Free' : `Paid (${symbol}${formatPrice(avail.additional_cost || 10)})`}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                              <X className="w-3.5 h-3.5" />
                              <span>Not available</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Landmarks & Attractions Count */}
            <div className="glass-panel p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Nearby Landmarks & Services</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Landmarks / Services Count
                </div>
                {hotels.map((h) => (
                  <div key={h.id} className="col-span-1 text-xs text-slate-700 dark:text-slate-200 font-bold">
                    {h.attractionsCount} Attractions / {h.nearbyServicesCount} Services
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Comparison Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Save Comparison List</h3>
            <p className="text-xs text-slate-400 mb-6">
              Save this comparison to revisit anytime from your account.
            </p>

            <form onSubmit={handleSaveList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  List Name / Title
                </label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  placeholder="E.g. Berlin Summer Trip Options"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? 'Saving...' : 'Save List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
