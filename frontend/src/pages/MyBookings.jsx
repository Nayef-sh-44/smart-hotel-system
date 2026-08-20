import React, { useState, useEffect } from 'react';
import { bookingService, hotelService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Hotel as HotelIcon,
  Calendar,
  Users,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
} from 'lucide-react';

export default function MyBookings() {
  const { isAuthenticated } = useAuth();
  const { symbol, formatPrice } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ check_in_date: '', check_out_date: '', num_guests: 1, room_id: '' });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const fetchMyBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await bookingService.cancel(id);
      if (res.success) {
        toast.success('Booking cancelled successfully.');
        fetchMyBookings();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Could not cancel booking.');
    }
  };

  const handleEditClick = async (booking) => {
    setEditingId(booking.id);
    setEditForm({
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      num_guests: booking.num_guests,
      room_id: booking.room_id,
    });
    try {
      const res = await hotelService.getById(booking.hotel_id || booking.hotel?.id);
      if (res.success) {
        setAvailableRooms(res.data.rooms || []);
      }
    } catch (err) {
      toast.error('Could not load room types.');
    }
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const res = await bookingService.update(editingId, {
        check_in_date: editForm.check_in_date,
        check_out_date: editForm.check_out_date,
        num_guests: Number(editForm.num_guests),
        room_id: Number(editForm.room_id),
      });
      if (res.success) {
        toast.success('Booking updated successfully.');
        setEditingId(null);
        fetchMyBookings();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Could not update booking.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center glass-panel p-8">
          <HotelIcon className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign in to View Bookings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Please sign in to manage your reservations and view booking references.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/30 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-12 pb-10 border-b border-slate-200 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            My Reservations ({bookings.length})
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            View booking references, room details, and manage your luxury stays.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel h-36 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 glass-panel max-w-md mx-auto">
            <HotelIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No reservations found</h3>
            <p className="text-sm text-slate-600 mb-6">
              You haven't booked any hotels yet. Browse our suites and book your first stay!
            </p>
            <Link to="/" className="btn-primary mx-auto inline-flex">
              Explore Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 sm:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        REF: {b.booking_reference}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>

                    <Link
                      to={`/hotels/${b.hotel?.id || b.hotel_id}`}
                      className="text-xl font-bold text-slate-900 hover:text-brand-600 transition-colors block"
                    >
                      {b.hotel ? b.hotel.name : `Hotel #${b.hotel_id}`}
                    </Link>

                    {editingId === b.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Check-in</label>
                          <input type="date" className="input-field text-sm p-2 w-full" value={editForm.check_in_date} onChange={(e) => setEditForm({...editForm, check_in_date: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Check-out</label>
                          <input type="date" className="input-field text-sm p-2 w-full" value={editForm.check_out_date} onChange={(e) => setEditForm({...editForm, check_out_date: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Guests</label>
                          <input type="number" min="1" className="input-field text-sm p-2 w-full" value={editForm.num_guests} onChange={(e) => setEditForm({...editForm, num_guests: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Room Type</label>
                          <select className="input-field text-sm p-2 w-full" value={editForm.room_id} onChange={(e) => setEditForm({...editForm, room_id: e.target.value})}>
                            {availableRooms.map(r => (
                              <option key={r.id} value={r.id}>{r.room_type} - {symbol}{formatPrice(r.price_per_night)}/night</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-700 font-medium mt-2">
                        <div className="flex items-center gap-1.5">
                          <HotelIcon className="w-4 h-4 text-brand-500" />
                          <span className="capitalize">
                            {b.room ? `${b.room.room_type} Suite` : 'Suite'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-brand-500" />
                          <span>
                            {new Date(b.check_in_date).toLocaleDateString()} —{' '}
                            {new Date(b.check_out_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-brand-500" />
                          <span>{b.num_guests} Guest(s)</span>
                        </div>
                      </div>
                    )}

                    {b.special_requests && !editingId && (
                      <p className="text-xs text-slate-600 italic mt-2">
                        Special requests: "{b.special_requests}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <div className="text-right mb-2">
                      {b.tax_amount != null && (
                        <div className="mb-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase block">Base: {symbol}{formatPrice(Number(b.total_price) - Number(b.tax_amount))}</span>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase block">Taxes & Fees: {symbol}{formatPrice(b.tax_amount)}</span>
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Paid</span>
                      <p className="text-3xl font-extrabold text-slate-900">{symbol}{formatPrice(b.total_price)}</p>
                    </div>

                    {editingId === b.id ? (
                      <div className="flex gap-2">
                        <button onClick={handleCancelEdit} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold transition-all">Cancel</button>
                        <button onClick={handleSaveEdit} disabled={editLoading} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5">
                          <Save className="w-3.5 h-3.5" />
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      b.status === 'confirmed' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEditClick(b)}
                            className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold transition-all flex items-center gap-1.5 justify-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Reservation
                          </button>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all flex items-center justify-center"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
