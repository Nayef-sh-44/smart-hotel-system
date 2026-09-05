import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../context/ComparisonContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { favoriteService } from '../services/api.js';
import { getImageUrl } from '../utils/imageUtils.js';
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
  Dumbbell,
  Bus,
  ConciergeBell,
  Snowflake,
  Briefcase,
  Eye,
  Flower2,
  Baby,
  CheckCircle
} from 'lucide-react';

const getAmenityIcon = (name) => {
  if (!name) return CheckCircle;
  const n = name.toLowerCase();
  if (n.includes('wi-fi') || n.includes('wifi')) return Wifi;
  if (n.includes('pool') || n.includes('swim')) return Waves;
  if (n.includes('fitness') || n.includes('gym')) return Dumbbell;
  if (n.includes('breakfast') || n.includes('dining') || n.includes('restaurant')) return Coffee;
  if (n.includes('parking') || n.includes('valet')) return Car;
  if (n.includes('business') || n.includes('work')) return Briefcase;
  if (n.includes('shuttle') || n.includes('airport')) return Bus;
  if (n.includes('view') || n.includes('balcony')) return Eye;
  if (n.includes('spa') || n.includes('massage') || n.includes('sauna')) return Flower2;
  if (n.includes('kids') || n.includes('child')) return Baby;
  if (n.includes('reception') || n.includes('24/7') || n.includes('desk')) return ConciergeBell;
  if (n.includes('air conditioning') || n.includes('ac')) return Snowflake;
  return CheckCircle;
};

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
  
  let dealStatus = 'none';
  if (deal) {
    const now = new Date();
    const start = new Date(deal.start_datetime);
    const end = new Date(deal.end_datetime);
    if (now > end) {
      dealStatus = 'expired';
    } else if (now < start) {
      dealStatus = 'upcoming';
    } else {
      dealStatus = 'active';
    }
  }


  return (
    <div className="glass-card group relative flex flex-col overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        <img
          src={hotel.images?.[0]?.image_url ? getImageUrl(hotel.images[0].image_url) : (hotel.primary_image_url ? getImageUrl(hotel.primary_image_url) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80')}
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
          {deal && (
            <div className={"absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-md border " + 
              (dealStatus === 'active' 
                ? 'bg-rose-600 text-white border-rose-500' 
                : dealStatus === 'upcoming'
                ? 'bg-amber-500 text-white border-amber-400'
                : 'bg-slate-200/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700')
            }>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {deal.discount_percentage}% OFF {dealStatus === 'expired' ? '� Expired' : dealStatus === 'upcoming' ? '� Upcoming' : 'Active Deal'}
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
        {hotel.amenities && hotel.amenities.length > 0 ? (
          <div className="flex items-center gap-3 py-2.5 border-y border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto no-scrollbar">
            {hotel.amenities.slice(0, 4).map((amenity) => {
              const IconComp = getAmenityIcon(amenity.name);
              // Shorten name for display
              let displayName = amenity.name;
              if (displayName.includes('Wi-Fi') || displayName.includes('Wi-fi')) displayName = 'Wi-Fi';
              else if (displayName.includes('Pool')) displayName = 'Pool';
              else if (displayName.includes('Fitness') || displayName.includes('Gym')) displayName = 'Gym';
              else if (displayName.includes('Breakfast')) displayName = 'Breakfast';
              else if (displayName.includes('Parking')) displayName = 'Parking';
              else if (displayName.includes('Business')) displayName = 'Business';
              else if (displayName.includes('Shuttle')) displayName = 'Shuttle';
              else if (displayName.includes('Spa')) displayName = 'Spa';
              else if (displayName.includes('View')) displayName = 'View';
              else if (displayName.includes('Kids')) displayName = 'Kids';
              else if (displayName.length > 12) displayName = displayName.substring(0, 10) + '..';

              return (
                <div key={amenity.id} className="flex items-center gap-1 text-xs whitespace-nowrap shrink-0" title={amenity.name}>
                  <IconComp className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                  <span>{displayName}</span>
                </div>
              );
            })}
            {hotel.amenities.length > 4 && (
              <div className="flex items-center text-xs text-slate-400 whitespace-nowrap shrink-0" title={`${hotel.amenities.length - 4} more amenities`}>
                +{hotel.amenities.length - 4}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2.5 border-y border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 mb-4">
            <div className="text-xs italic text-slate-400">No amenities listed</div>
          </div>
        )}

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
