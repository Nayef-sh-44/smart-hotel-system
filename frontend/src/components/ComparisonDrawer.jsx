import React from 'react';
import { useComparison } from '../context/ComparisonContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Scale, X, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparisonDrawer() {
  const { selectedHotels, removeHotel, clearComparison, count } = useComparison();
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl"
      >
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Compare Hotels</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                  {count} / 4
                </span>
              </h4>
              <p className="text-xs text-slate-500 hidden sm:block">
                Select up to 4 hotels to view a side-by-side amenity & pricing matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {selectedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shrink-0 group"
              >
                <span className="max-w-[120px] truncate font-medium">{hotel.name}</span>
                <button
                  onClick={() => removeHotel(hotel.id)}
                  className="p-1 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearComparison}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/compare')}
              disabled={count < 2}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
