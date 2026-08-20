import React, { useState, useEffect } from 'react';
import { managerService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Hotel,
  BedDouble,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  LogOut,
  Edit,
} from 'lucide-react';

export default function ManagerPortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('hotel');
  const [loading, setLoading] = useState(true);

  // Data state
  const [myHotel, setMyHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    id: null,
    season_factor: 1.0,
    occupancy_factor: 1.0,
    event_factor: 1.0,
    weekend_factor: 1.0,
    manual_factor: 1.0,
    reason: '',
  });

  // Modal State for new Room
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    room_type: 'deluxe',
    capacity: 2,
    price_per_night: 250,
    available_rooms: 5,
  });

  // Modal State for Flash Deal
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealForm, setDealForm] = useState({
    title: 'Summer Getaway Special',
    discount_percentage: 20,
    start_date: '2026-08-01',
    end_date: '2026-09-30',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hotel') {
        const res = await managerService.getMyHotel();
        if (res.success) setMyHotel(res.data);
      } else if (activeTab === 'rooms') {
        const res = await managerService.getRooms();
        if (res.success) setRooms(res.data);
      } else if (activeTab === 'bookings') {
        const res = await managerService.getBookings();
        if (res.success) setBookings(res.data);
      } else if (activeTab === 'pricing') {
        const res = await managerService.getPricingRules();
        if (res.success) setPricingRules(res.data);
      } else if (activeTab === 'deals') {
        const res = await managerService.getFlashDeals();
        if (res.success) setFlashDeals(res.data);
      }
    } catch (err) {
      toast.error(err.error?.message || 'Error loading manager data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.updateMyHotel({
        name: myHotel.name,
        description: myHotel.description,
        address: myHotel.address,
        phone_number: myHotel.phone_number,
        base_price_per_night: myHotel.base_price_per_night,
      });
      if (res.success) {
        toast.success('Hotel details updated successfully!');
      }
    } catch (err) {
      toast.error('Could not update hotel details');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createRoom({
        room_type: roomForm.room_type,
        capacity: Number(roomForm.capacity),
        price_per_night: Number(roomForm.price_per_night),
        available_rooms: Number(roomForm.available_rooms),
      });
      if (res.success) {
        toast.success('New suite room added!');
        setRoomModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room suite?')) return;
    try {
      await managerService.deleteRoom(id);
      toast.success('Room deleted');
      fetchData();
    } catch (err) {
      toast.error('Could not delete room');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await managerService.updateBookingStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Could not update booking status');
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createFlashDeal({
        title: dealForm.title,
        discount_percentage: Number(dealForm.discount_percentage),
        start_date: dealForm.start_date,
        end_date: dealForm.end_date,
      });
      if (res.success) {
        toast.success('Flash deal published!');
        setDealModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Failed to publish deal');
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm('Delete this promotional deal?')) return;
    try {
      await managerService.deleteFlashDeal(id);
      toast.success('Flash deal removed');
      fetchData();
    } catch (err) {
      toast.error('Could not delete flash deal');
    }
  };

  const handleCreateOrUpdateRule = async (e) => {
    e.preventDefault();
    try {
      if (isEditingRule) {
        const res = await managerService.updatePricingRule(ruleForm.id, ruleForm);
        if (res.success) toast.success('Rule updated!');
      } else {
        const res = await managerService.createPricingRule(ruleForm);
        if (res.success) toast.success('Pricing rule created!');
      }
      setRuleModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.error?.message || 'Failed to save rule');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this pricing rule?')) return;
    try {
      await managerService.deletePricingRule(id);
      toast.success('Pricing rule removed');
      fetchData();
    } catch (err) {
      toast.error('Could not delete rule');
    }
  };

  const openRuleModal = (rule = null) => {
    if (rule) {
      setIsEditingRule(true);
      setRuleForm({ ...rule });
    } else {
      setIsEditingRule(false);
      setRuleForm({
        id: null,
        season_factor: 1.0,
        occupancy_factor: 1.0,
        event_factor: 1.0,
        weekend_factor: 1.0,
        manual_factor: 1.0,
        reason: '',
      });
    }
    setRuleModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-10 pb-8 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Hotel Management Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manager Portal</h1>
            <p className="text-sm text-slate-700 mt-1">
              Manage your hotel information, suites, reservations, and dynamic pricing rules.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'hotel', name: 'My Hotel', icon: Hotel },
            { id: 'rooms', name: 'Suites & Rooms', icon: BedDouble },
            { id: 'bookings', name: 'Guest Reservations', icon: CalendarCheck },
            { id: 'pricing', name: 'Dynamic Pricing', icon: TrendingUp },
            { id: 'deals', name: 'Flash Deals', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === t.id
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {loading ? (
            <div className="glass-panel p-10 text-center text-slate-500 dark:text-slate-400 animate-pulse">
              Loading manager console data...
            </div>
          ) : activeTab === 'hotel' ? (
            myHotel ? (
              <form onSubmit={handleUpdateHotel} className="glass-panel p-5 sm:p-6 max-w-2xl space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Hotel Details</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={myHotel.name || ''}
                    onChange={(e) => setMyHotel({ ...myHotel, name: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="4"
                    value={myHotel.description || ''}
                    onChange={(e) => setMyHotel({ ...myHotel, description: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={myHotel.address || ''}
                      onChange={(e) => setMyHotel({ ...myHotel, address: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Price / Night (€)
                    </label>
                    <input
                      type="number"
                      value={myHotel.base_price_per_night || ''}
                      onChange={(e) =>
                        setMyHotel({ ...myHotel, base_price_per_night: e.target.value })
                      }
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-4">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="text-center py-12 glass-panel">No hotel assigned to your account.</div>
            )
          ) : activeTab === 'rooms' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Suites & Rooms</h3>
                <button onClick={() => setRoomModalOpen(true)} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Room Suite</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((r) => (
                  <div key={r.id} className="glass-card p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/30 capitalize font-bold">
                          {r.room_type} Suite
                        </span>
                        <button
                          onClick={() => handleDeleteRoom(r.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Max Capacity: {r.capacity} Guest(s)
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Rate</span>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">€{r.price_per_night}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {r.available_rooms} Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'bookings' ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Guest Reservations</h3>
              {bookings.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No reservations found.</p>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-brand-400">
                          REF: {b.booking_reference}
                        </span>
                        <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                          {b.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Guest: {b.user ? b.user.full_name : `User #${b.user_id}`} ({b.user?.email})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(b.check_in_date).toLocaleDateString()} to{' '}
                        {new Date(b.check_out_date).toLocaleDateString()} — Total: €
                        {Number(b.total_price).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold"
                        >
                          Complete
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'pricing' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Pricing Rules</h3>
                <button onClick={() => openRuleModal()} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Create Pricing Rule</span>
                </button>
              </div>

              {pricingRules.length === 0 ? (
                <div className="glass-panel p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No pricing rules defined.</p>
                  <p className="text-xs text-slate-400 mt-1">Add rules to automatically adjust your room prices based on seasons, weekends, and occupancy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pricingRules.map((rule) => (
                    <div key={rule.id} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`badge ${rule.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'} font-bold`}>
                            {rule.is_active ? 'Active' : 'Disabled'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openRuleModal(rule)}
                              className="p-1.5 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{rule.reason || 'Unnamed Rule'}</h4>
                        
                        <div className="grid grid-cols-2 gap-y-2 mt-4 text-xs">
                          <div className="flex flex-col">
                            <span className="text-slate-500">Season</span>
                            <span className="font-semibold text-slate-900">{rule.season_factor}x</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Weekend</span>
                            <span className="font-semibold text-slate-900">{rule.weekend_factor}x</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Occupancy</span>
                            <span className="font-semibold text-slate-900">{rule.occupancy_factor}x</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Event/Manual</span>
                            <span className="font-semibold text-slate-900">{Math.max(rule.event_factor, rule.manual_factor)}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'deals' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Promotional Flash Deals</h3>
                <button onClick={() => setDealModalOpen(true)} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Publish Flash Deal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashDeals.map((fd) => (
                  <div key={fd.id} className="glass-card p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                          {fd.discount_percentage}% OFF
                        </span>
                        <button
                          onClick={() => handleDeleteDeal(fd.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{fd.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Valid: {new Date(fd.start_date).toLocaleDateString()} to{' '}
                        {new Date(fd.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Rule Modal */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {isEditingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
            </h3>
            <form onSubmit={handleCreateOrUpdateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Rule Name / Reason</label>
                <input
                  type="text"
                  value={ruleForm.reason}
                  onChange={(e) => setRuleForm({ ...ruleForm, reason: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Summer Peak"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Season Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={ruleForm.season_factor}
                    onChange={(e) => setRuleForm({ ...ruleForm, season_factor: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Weekend Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={ruleForm.weekend_factor}
                    onChange={(e) => setRuleForm({ ...ruleForm, weekend_factor: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Occupancy Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={ruleForm.occupancy_factor}
                    onChange={(e) => setRuleForm({ ...ruleForm, occupancy_factor: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Event Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={ruleForm.event_factor}
                    onChange={(e) => setRuleForm({ ...ruleForm, event_factor: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Manual Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={ruleForm.manual_factor}
                    onChange={(e) => setRuleForm({ ...ruleForm, manual_factor: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                {isEditingRule && (
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="rule_active"
                      checked={ruleForm.is_active}
                      onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="rule_active" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Is Active
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  {isEditingRule ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Suite Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Room Suite</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Room Type</label>
                <select
                  value={roomForm.room_type}
                  onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="deluxe">Deluxe Suite</option>
                  <option value="executive">Executive Suite</option>
                  <option value="presidential">Presidential Suite</option>
                  <option value="standard">Standard Room</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Price (€ / Night)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={roomForm.price_per_night}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, price_per_night: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Available Rooms Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomForm.available_rooms}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, available_rooms: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flash Deal Modal */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Publish Flash Deal</h3>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={dealForm.discount_percentage}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, discount_percentage: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dealForm.start_date}
                    onChange={(e) => setDealForm({ ...dealForm, start_date: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dealForm.end_date}
                    onChange={(e) => setDealForm({ ...dealForm, end_date: e.target.value })}
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDealModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Publish Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
