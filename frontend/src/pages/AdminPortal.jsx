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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, { role: newRole });
      if (res.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Could not update role');
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    try {
      if (!managerForm.hotel_id) {
        toast.error('Please select a hotel');
        return;
      }
      // 1. Create a regular user
      const registerRes = await authService.register({
        full_name: managerForm.full_name,
        email: managerForm.email,
        password: managerForm.password,
        phone_number: managerForm.phone_number,
      });

      if (registerRes.success) {
        const newUserId = registerRes.data.user.id;
        // 2. Upgrade to hotel_manager and link to hotel
        const roleRes = await adminService.updateUserRole(newUserId, {
          role: 'hotel_manager',
          hotel_id: Number(managerForm.hotel_id),
        });

        if (roleRes.success) {
          toast.success('Hotel Manager Account created successfully!');
          setManagerModalOpen(false);
          setManagerForm({
            full_name: '',
            email: '',
            password: '',
            phone_number: '',
            hotel_id: '',
          });
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.error?.message || 'Failed to create manager account');
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
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">{u.phone_number || 'N/A'}</td>
                        <td className="py-3">
                          <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2 py-1 rounded bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
                          >
                            <option value="user">User</option>
                            <option value="hotel_manager">Hotel Manager</option>
                            <option value="system_admin">System Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Assign to Hotel</label>
                <select
                  value={managerForm.hotel_id}
                  onChange={(e) => setManagerForm({ ...managerForm, hotel_id: e.target.value })}
                  className="input-field text-sm"
                  required
                >
                  <option value="" disabled>Select a hotel...</option>
                  {hotelsList.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
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
