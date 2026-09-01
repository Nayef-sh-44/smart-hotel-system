import React, { useState, useEffect } from 'react';
import { adminService, authService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Users,
  Hotel,
  DollarSign,
  CalendarCheck,
  CheckCircle,
  Trash2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Plus,
} from 'lucide-react';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Data state
  const [usersList, setUsersList] = useState([]);
  const [hotelsList, setHotelsList] = useState([]);

  // Create Manager State
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    hotel_id: '',
  });



  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const [usersRes, hotelsRes] = await Promise.all([
          adminService.getUsers(),
          adminService.getHotels(),
        ]);
        if (usersRes.success) setUsersList(usersRes.data);
        if (hotelsRes.success) setHotelsList(hotelsRes.data);
      }
    } catch (err) {
      toast.error(err.error?.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete this hotel manager account and its hotel?`)) {
       return;
    }
    try {
      const res = await adminService.deleteUser(user.id);
      if (res.success) {
        toast.success(`Account deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.error?.message || 'Could not delete user account');
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createUser({
        full_name: managerForm.full_name,
        email: managerForm.email,
        password: managerForm.password,
        phone_number: managerForm.phone_number,
        role: 'hotel_manager'
      });

      if (res.success) {
        toast.success('Hotel Manager created successfully!');
        setManagerForm({
          full_name: '',
          email: '',
          password: '',
          phone_number: '',
        });
        setManagerModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.error?.message || 'Could not create manager');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-10 pb-8 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>System Administration Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-700 mt-1">
              Real-time KPIs, user role management, and review moderation.
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'users', name: 'User Management', icon: Users },
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
              Loading administration metrics...
            </div>
          ) : activeTab === 'users' ? (
            <div className="glass-panel p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registered System Users</h3>
                <button onClick={() => setManagerModalOpen(true)} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Create Hotel Manager</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Assigned Hotel</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {usersList.map((u) => {
                      const assignedHotel = hotelsList.find(h => h.id === u.hotel_id);
                      return (
                      <tr key={u.id}>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">{u.phone_number || 'N/A'}</td>
                        <td className="py-3">
                          <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                          {u.role === 'hotel_manager' ? (assignedHotel ? assignedHotel.name : 'Not Assigned') : '-'}
                        </td>
                        <td className="py-3 flex items-center gap-2">
                          {u.role !== 'admin' && u.role !== 'system_admin' && (
                            <button
                               onClick={() => handleDeleteUser(u)}
                               className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1"
                               title="Delete Account"
                            >
                               <Trash2 className="w-4 h-4" />
                               <span className="sr-only">Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Manager Modal */}
      {managerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Create Hotel Manager
            </h3>
            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={managerForm.full_name}
                  onChange={(e) => setManagerForm({ ...managerForm, full_name: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                  className="input-field text-sm"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={managerForm.phone_number}
                  onChange={(e) => setManagerForm({ ...managerForm, phone_number: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setManagerModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
