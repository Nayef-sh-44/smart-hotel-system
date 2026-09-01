import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { hotelService, reviewService, bookingService, loyaltyService, favoriteService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useComparison } from '../context/ComparisonContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { getImageUrl } from '../utils/imageUtils.js';
import toast from 'react-hot-toast';
import {
  Star,
  MapPin,
  Check,
  Scale,
  Sparkles,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  Waves,
  Coffee,
  Car,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Navigation,
  Compass,
  Tag,
  Shield,
  Loader2,
  Heart,
  Map as MapLucide
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a custom styled Leaflet icon to mimic the old design
const createCustomIcon = (name) => {
  return L.divIcon({
    className: 'custom-hotel-marker',
    html: `<div style="background-color: #1e3a8a; color: white; padding: 5px 10px; border-radius: 12px; font-weight: bold; font-size: 13px; border: 2px solid #fbbf24; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap; font-family: inherit;">🏨 ${name.substring(0, 20)}${name.length > 20 ? '...' : ''}</div>`,
    iconSize: [140, 32],
    iconAnchor: [70, 16]
  });
};

// Haversine Distance Calculator
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function MapUpdater({ selectedHotel }) {
  const map = useMap();
  useEffect(() => {
    if (selectedHotel && selectedHotel.latitude && selectedHotel.longitude) {
      map.flyTo([selectedHotel.latitude, selectedHotel.longitude], 14, { duration: 1.5 });
    }
  }, [selectedHotel, map]);
  return null;
}

export default function HotelDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rewardParam = searchParams.get('reward');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toggleComparison, isSelected } = useComparison();
  const { symbol, formatPrice } = useCurrency();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const [applyReward, setApplyReward] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Review Form Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Map state
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [mapFilter, setMapFilter] = useState('all');

  const fetchNearbyPlaces = async (lat, lon) => {
    setIsFetchingPlaces(true);
    setNearbyPlaces([]);
    try {
      const overpassQuery = `[out:json][timeout:12];
      (
        node["tourism"~"attraction|museum|artwork|viewpoint"](around:2500,${lat},${lon});
        node["amenity"~"restaurant|cafe|fast_food|hospital|pharmacy|atm|bank"](around:2500,${lat},${lon});
        node["shop"~"mall|supermarket|department_store"](around:2500,${lat},${lon});
      );
      out body 40;`;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      const data = await res.json();
      
      if (data && data.elements) {
        const places = [];
        data.elements.forEach(node => {
          if (!node.lat || !node.lon || !node.tags) return;
          const tags = node.tags;
          let name = tags.name || tags['name:en'] || '';
          if (!name) return;

          let category = 'Tourist Attraction';
          let group = 'attraction';
          let color = '#6366f1';

          if (tags.tourism === 'museum') { category = 'Museum'; group = 'museum'; color = '#8b5cf6'; }
          else if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') { category = 'Tourist Attraction'; group = 'attraction'; color = '#f59e0b'; }
          else if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') { category = 'Restaurant'; group = 'restaurant'; color = '#3b82f6'; }
          else if (tags.amenity === 'cafe') { category = 'Cafe'; group = 'restaurant'; color = '#d97706'; }
          else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') { category = 'Hospital'; group = 'hospital'; color = '#ef4444'; }
          else if (tags.amenity === 'pharmacy') { category = 'Pharmacy'; group = 'hospital'; color = '#ec4899'; }
          else if (tags.amenity === 'atm' || tags.amenity === 'bank') { category = 'ATM'; group = 'atm'; color = '#10b981'; }
          else if (tags.shop) { category = 'Shopping'; group = 'shopping'; color = '#06b6d4'; }

          places.push({ id: node.id, name, lat: node.lat, lon: node.lon, category, group, color });
        });
        setNearbyPlaces(places);
      }
    } catch (err) {
      console.error("Failed to fetch nearby places", err);
    } finally {
      setIsFetchingPlaces(false);
    }
  };

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const res = await hotelService.getById(id);
      if (res.success) {
        setHotel(res.data);
        if (res.data.latitude && res.data.longitude) {
          fetchNearbyPlaces(res.data.latitude, res.data.longitude);
        }
      }
      const revRes = await reviewService.getByHotel(id);
      if (revRes.success) {
        setReviews(revRes.data);
      }
    } catch (err) {
      toast.error('Failed to load hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteStatus = async () => {
    if (isAuthenticated) {
      try {
        const res = await favoriteService.getAll();
        if (res.success) {
          const isFav = res.data.some(fav => fav.hotel_id === Number(id));
          setIsFavorited(isFav);
        }
      } catch (err) {
        console.error('Could not fetch favorite status', err);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites.');
      return;
    }
    setTogglingFavorite(true);
    try {
      if (isFavorited) {
        await favoriteService.remove(id);
        setIsFavorited(false);
        toast.success('Removed from favorites.');
      } else {
        await favoriteService.add(id);
        setIsFavorited(true);
        toast.success('Added to favorites.');
      }
    } catch (err) {
      toast.error('Could not update favorite status.');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const fetchRewardDetails = async () => {
    if (rewardParam && isAuthenticated) {
      try {
        const res = await loyaltyService.getLoyaltyForHotel(id);
        if (res.success && res.data && res.data.rewards) {
          const rew = res.data.rewards.find(r => r.id === Number(rewardParam));
          if (rew) {
            setPendingReward({ reward: rew });
          }
        }
      } catch (e) {
        console.error('Could not fetch reward details', e);
      }
    }
  };

  useEffect(() => {
    fetchHotelDetails();
    fetchFavoriteStatus();
    fetchRewardDetails();
  }, [id, isAuthenticated, rewardParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Hotel Not Found</h2>
        <Link to="/" className="btn-primary inline-flex">
          Back to Explore
        </Link>
      </div>
    );
  }

  const selected = isSelected(hotel.id);
  const hasFlashDeal = hotel.flashDeals && hotel.flashDeals.length > 0;
  const activeDeal = hasFlashDeal ? hotel.flashDeals[0] : null;

  // Calculate nights
  const getNights = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end <= start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();

  const handleOpenBookingModal = async (room) => {
    if (!user) {
      toast.error('Please login to book a room.');
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setBookingModalOpen(true);

    try {
      const res = await loyaltyService.getLoyaltyForHotel(id);
      if (res.success && res.data) {
        setLoyaltyPoints(res.data.points || 0);
      }
      if (res.success && res.data.rewardInstances) {
        const unredeemed = res.data.rewardInstances.filter(r => !r.is_redeemed);
        if (unredeemed.length > 0) {
          const oldest = unredeemed.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))[0];
          setPendingReward(oldest);
        }
      }
    } catch (err) {
      console.error('Could not fetch loyalty data for checkout', err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (nights <= 0) {
      toast.error('Check-out date must be after Check-in date.');
      return;
    }
    setSubmittingBooking(true);
    try {
      const res = await bookingService.create({
        hotel_id: hotel.id,
        room_id: selectedRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: Number(numGuests),
        special_requests: specialRequests,
        reward_id: applyReward && pendingReward ? pendingReward.reward.id : null,
      });

      if (res.success) {
        if (res.data.loyalty_points_earned > 0) {
          toast.success(`Booking confirmed! You earned ${res.data.loyalty_points_earned} loyalty points at this hotel.`);
        } else {
          toast.success(`Booking confirmed! Ref: ${res.data.booking_reference}`);
        }
        setBookingModalOpen(false);
        navigate('/my-bookings');
      }
    } catch (err) {
      toast.error(err.error?.message || 'Failed to complete reservation.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await reviewService.create({
        hotel_id: hotel.id,
        overall_rating: Number(rating),
        cleanliness_rating: Number(rating),
        location_rating: Number(rating),
        service_rating: Number(rating),
        value_rating: Number(rating),
        comment: comment,
      });

      if (res.success) {
        toast.success('Review submitted successfully!');
        setReviewModalOpen(false);
        setComment('');
        fetchHotelDetails();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Nav Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotels</span>
        </Link>
      </div>

      {/* Hero Header & Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(hotel.star_rating).toFixed(1)} Star Luxury</span>
              </div>
              {hasFlashDeal && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-accent-600 to-amber-500 text-dark-950 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeDeal.discount_percentage}% Flash Deal</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{hotel.name}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                {hotel.address}
                {hotel.city && ` - ${hotel.city.name}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleComparison(hotel)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                selected
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/80'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{selected ? 'In Comparison' : 'Compare'}</span>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={toggleFavorite}
                disabled={togglingFavorite}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
                <span>{isFavorited ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden">
          <div className="md:col-span-2 h-80 sm:h-96 relative bg-slate-200 dark:bg-slate-800">
            <img
              src={hotel.images?.[0] ? getImageUrl(hotel.images[0].image_url) : (hotel.primary_image_url ? getImageUrl(hotel.primary_image_url) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80')}
              alt={hotel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
          
          <div className="hidden md:flex flex-col gap-4 h-96">
            <div className="h-1/2 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img
                src={hotel.images?.[1] ? getImageUrl(hotel.images[1].image_url) : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'}
                alt="Suite View"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/2 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img
                src={hotel.images?.[2] ? getImageUrl(hotel.images[2].image_url) : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                alt="Interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Amenities, Rooms, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description & Overview */}
          <div className="glass-panel p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {hotel.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {hotel.description ||
                'Immerse yourself in unrivaled luxury and comfort. Featuring panoramic views, bespoke furnishings, state-of-the-art wellness centers, and gourmet dining experiences curated by award-winning chefs.'}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="glass-panel p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Hotel Amenities & Services</h3>
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <Check className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="truncate">{amenity.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">All standard luxury amenities included.</p>
            )}
          </div>

          {/* Rooms Table / Cards */}
          <div className="glass-panel p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Available Suites & Rooms</h3>
            <div className="space-y-4">
              {hotel.rooms && hotel.rooms.length > 0 ? (
                hotel.rooms.filter(room => room.status !== 'unavailable').map((room) => (
                  <div
                    key={room.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      {room.images && room.images.length > 0 && (
                        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={getImageUrl(room.images[0].image_url)} alt="Room Suite" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                            {room.room_type} Suite
                          </h4>
                          {room.available_rooms > 0 && room.is_available ? (
                            <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {room.available_rooms} Left
                            </span>
                          ) : (
                            <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Max Capacity: {room.capacity} Guest{room.capacity > 1 ? 's' : ''} — Free Cancellation up to 48 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {symbol}{formatPrice(room.price_per_night)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">/ night</span>
                      </div>

                      <button
                        onClick={() => handleOpenBookingModal(room)}
                        disabled={room.available_rooms < 1 || !room.is_available}
                        className="btn-primary text-xs py-2 px-5 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <span>Book Room</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">No available rooms listed at the moment.</p>
              )}
            </div>
          </div>

          {/* Guest Reviews Section */}
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Guest Reviews</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified guest feedback & overall ratings
                </p>
              </div>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="btn-secondary text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rev.user ? rev.user.full_name : 'Verified Guest'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{Number(rev.overall_rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No guest reviews yet. Be the first to leave a review!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Booking Card & Nearby Services */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sticky top-28">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Reservation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Select a room from the list on the left to start booking your luxury stay.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Best Price Guarantee</span>
                <span className="text-emerald-400 font-semibold">100% Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Loyalty Points Earned</span>
                <span className="text-brand-400 font-semibold">10 Points / {symbol}10</span>
              </div>
            </div>
          </div>

          {/* Nearby Services */}
          <div className="glass-panel p-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-400" />
              <span>Nearby Services</span>
            </h4>
            {hotel.nearbyServices && hotel.nearbyServices.length > 0 ? (
              <div className="space-y-3">
                {hotel.nearbyServices.map((ns) => (
                  <div key={ns.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium truncate">{ns.service_name}</span>
                    <span className="text-slate-400">{ns.distance_km} km</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No nearby services listed.</p>
            )}
          </div>

          {/* Tourist Attractions */}
          <div className="glass-panel p-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent-500" />
              <span>Attractions & Landmarks</span>
            </h4>
            {hotel.attractions && hotel.attractions.length > 0 ? (
              <div className="space-y-3">
                {hotel.attractions.map((ta) => (
                  <div key={ta.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium truncate">{ta.attraction_name}</span>
                    <span className="text-slate-400">{ta.distance_km} km</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No landmarks listed.</p>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {hotel.latitude && hotel.longitude && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapLucide className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Location & Nearby Places</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setMapFilter('all')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'all' ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>All Places</button>
                <button type="button" onClick={() => setMapFilter('attraction')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'attraction' ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>Attractions</button>
                <button type="button" onClick={() => setMapFilter('restaurant')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'restaurant' ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>Dining & Cafes</button>
                <button type="button" onClick={() => setMapFilter('shopping')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'shopping' ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>Shopping</button>
                <button type="button" onClick={() => setMapFilter('hospital')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'hospital' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>Health</button>
                <button type="button" onClick={() => setMapFilter('atm')} className={`px-3 py-1 text-xs rounded-full border ${mapFilter === 'atm' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-950/60 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white'}`}>ATM & Banks</button>
              </div>

              {isFetchingPlaces && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span>Fetching real-time OpenStreetMap / Overpass API surrounding attractions...</span>
                </div>
              )}
            </div>
            
            <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer 
                center={[hotel.latitude, hotel.longitude]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <MapUpdater selectedHotel={hotel} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Marker 
                  position={[hotel.latitude, hotel.longitude]}
                  icon={createCustomIcon(hotel.name)}
                >
                  <Popup className="custom-popup">
                    <div className="text-slate-800 font-sans p-1 min-w-[200px]">
                      <h3 className="font-bold text-sm mb-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-600 mb-2">{hotel.address}</p>
                    </div>
                  </Popup>
                </Marker>

                {nearbyPlaces.filter(p => mapFilter === 'all' || p.group === mapFilter).map((place) => {
                  const dist = getDistanceFromLatLonInKm(hotel.latitude, hotel.longitude, place.lat, place.lon);
                  return (
                    <CircleMarker
                      key={`poi-${place.id}`}
                      center={[place.lat, place.lon]}
                      radius={7}
                      pathOptions={{
                        color: '#ffffff',
                        weight: 2,
                        fillColor: place.color,
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="text-slate-800 font-sans p-1 min-w-[160px]">
                          <h3 className="font-bold text-sm mb-1" style={{color: '#1e3a8a'}}>{place.name}</h3>
                          <div className="mt-1 text-xs text-slate-600 space-y-1">
                            <div><strong>Category:</strong> <span className="px-2 py-0.5 rounded text-white font-semibold text-[10px]" style={{backgroundColor: place.color}}>{place.category}</span></div>
                            <div><strong>Distance:</strong> {dist.toFixed(2)} km</div>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-lg w-full relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Confirm Reservation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {hotel.name} — <span className="capitalize">{selectedRoom.room_type} Suite</span>
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Number of Guests (Max: {selectedRoom.capacity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom.capacity}
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows="2"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="E.g. High floor, quiet room, late arrival..."
                  className="input-field text-xs"
                />
              </div>

              {/* Price Calculation Summary */}
              {(() => {
                const rawPrice = Number(selectedRoom.price_per_night) * Math.max(1, nights);
                let discount = 0;
                if (pendingReward && pendingReward.reward && applyReward) {
                  if (pendingReward.reward.reward_type === 'percentage_discount') {
                    discount = rawPrice * (Number(pendingReward.reward.reward_value) / 100);
                  } else {
                    discount = Number(pendingReward.reward.reward_value);
                  }
                }
                const baseDiscounted = Math.max(0, rawPrice - discount);
                const taxes = baseDiscounted * 0.03;
                const finalTotal = baseDiscounted + taxes;

                return (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Room Rate ({selectedRoom.room_type})</span>
                      <span>{symbol}{formatPrice(selectedRoom.price_per_night)} / night</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Nights</span>
                      <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                    </div>
                    {pendingReward && (
                      <div className="flex flex-col gap-2 mt-4">
                        {!applyReward ? (
                          <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-lg flex items-center justify-between border border-brand-200 dark:border-brand-800">
                            <div>
                              <p className="text-xs font-bold text-brand-700 dark:text-brand-400">🎁 Loyalty Reward Available</p>
                              <p className="text-[10px] text-brand-600 dark:text-brand-500">
                                {pendingReward.reward.reward_name}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setApplyReward(true)}
                              className="px-3 py-1 bg-brand-500 text-white rounded text-xs font-bold hover:bg-brand-600"
                            >
                              Use Reward
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Loyalty Reward Applied</p>
                              <button
                                type="button"
                                onClick={() => setApplyReward(false)}
                                className="text-[10px] text-emerald-600 underline hover:text-emerald-700"
                              >
                                Remove Reward
                              </button>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-bold text-sm">
                              <span>Discount:</span>
                              <span>-{symbol}{formatPrice(discount)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Taxes & Fees (3%)</span>
                      <span>{symbol}{formatPrice(taxes)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>Final Total Estimated Price</span>
                      <span>{symbol}{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking || nights <= 0}
                  className="btn-primary text-xs"
                >
                  {submittingBooking ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Write a Guest Review</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Share your feedback for {hotel.name}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Overall Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="5">5 - Excellent & Luxury</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Below Average</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Your Review
                </label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your stay, comfort, staff, and location..."
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn-primary text-xs">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
