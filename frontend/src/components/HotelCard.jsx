import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../context/ComparisonContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { favoriteService } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  Star,
  MapPin,
  Scale,
  Heart,
  Sparkles,
  Check,
  Wifi,
  Waves,
  Coffee,
  Car,
  ArrowRight,
} from 'lucide-react';

export default function HotelCard({ hotel, isFavoriteInitial = false, onFavoriteToggle }) {
  const { toggleComparison, isSelected } = useComparison();
  const { isAuthenticated } = useAuth();
  const { symbol, formatPrice } = useCurrency();
  const [isFav, setIsFav] = React.useState(isFavoriteInitial);
  const selected = isSelected(hotel.id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save favorite hotels.');
      return;
    }
    try {
      if (isFav) {
        await favoriteService.remove(hotel.id);
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.add(hotel.id);
        setIsFav(true);
        toast.success('Saved to favorites');
      }
      if (onFavoriteToggle) onFavoriteToggle(hotel.id, !isFav);
    } catch (err) {
      toast.error('Could not update favorites.');
    }
  };

  const hasFlashDeal = hotel.flashDeals && hotel.flashDeals.length > 0;
  const deal = hasFlashDeal ? hotel.flashDeals[0] : null;

  return (
    <div className="glass-card group relative flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        <img
          src={hotel.primary_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-dark-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-amber-500 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            <span>{Number(hotel.star_rating).toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Toggle Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleComparison(hotel);
              }}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                selected
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-white/90 dark:bg-dark-900/80 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              title={selected ? 'Remove from comparison' : 'Compare hotel'}
            >
              {selected ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                isFav
                  ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-500/20 dark:border-rose-500/50 dark:text-rose-400'
                  : 'bg-white/90 dark:bg-dark-900/80 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/50'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 dark:fill-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Flash Deal Tag */}
        {hasFlashDeal && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-100 dark:bg-gradient-to-r dark:from-accent-600 dark:to-amber-500 text-accent-700 dark:text-dark-950 font-bold text-xs shadow-md dark:shadow-lg animate-pulse border border-accent-200 dark:border-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {deal.discount_percentage}% OFF {deal.title}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium mb-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {hotel.city ? hotel.city.name : ''}
            {hotel.city?.country ? `, ${hotel.city.country}` : ''}
          </span>
        </div>

        <Link to={`/hotels/${hotel.id}`} className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">{hotel.name}</h3>
        </Link>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {hotel.description || 'Experience world-class luxury, prime location, and exceptional amenities designed for the modern traveler.'}
        </p>

        {/* Quick Amenities Preview */}
        <div className="flex items-center gap-3 py-2.5 border-y border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1 text-xs" title="Free Wi-Fi">
            <Wifi className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Wi-Fi</span>
          </div>
          <div className="flex items-center gap-1 text-xs" title="Pool">
            <Waves className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Pool</span>
          </div>
          <div className="flex items-center gap-1 text-xs" title="Restaurant">
            <Coffee className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Dining</span>
          </div>
          <div className="flex items-center gap-1 text-xs" title="Parking">
            <Car className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Parking</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {symbol}{formatPrice(hotel.base_price_per_night || 199)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ night</span>
            </div>
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 dark:bg-brand-600/20 dark:hover:bg-brand-600 dark:text-brand-400 dark:hover:text-white dark:border-brand-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>View Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
