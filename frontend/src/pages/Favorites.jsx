import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import HotelCard from '../components/HotelCard.jsx';
import { Link } from 'react-router-dom';
import { Heart, Hotel as HotelIcon } from 'lucide-react';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await favoriteService.getAll();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const handleFavoriteToggle = (hotelId, newFavStatus) => {
    if (!newFavStatus) {
      setFavorites(favorites.filter((f) => f.hotel && f.hotel.id !== hotelId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center glass-panel p-8">
          <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign in to View Favorites</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Please sign in or create an account to save and manage your favorite luxury hotels.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-12 pb-10 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            <span>Saved Suites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            My Favorite Hotels ({favorites.length})
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Your personally curated collection of luxury hotels and suites.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-96 animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 px-6 glass-panel max-w-md mx-auto">
            <HotelIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No favorites saved yet</h3>
            <p className="text-sm text-slate-600 mb-6">
              Browse our explore page and click the heart icon on any hotel to add it here.
            </p>
            <Link to="/" className="btn-primary mx-auto inline-flex">
              Explore Hotels
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(
              (item) =>
                item.hotel && (
                  <HotelCard
                    key={item.id}
                    hotel={item.hotel}
                    isFavoriteInitial={true}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
