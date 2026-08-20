import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Lock, Save, ArrowRight } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    preferred_currency: user?.preferred_currency || 'EUR',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);

  if (!isAuthenticated) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    await updateProfile(profileForm);
    setLoadingProfile(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-12 pb-10 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Account Preferences</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal details, preferred currency, and security settings.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Profile Card */}
        <form onSubmit={handleProfileSubmit} className="glass-panel p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, full_name: e.target.value })
              }
              className="input-field text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone_number}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone_number: e.target.value })
                }
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Currency
              </label>
              <select
                value={profileForm.preferred_currency}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, preferred_currency: e.target.value })
                }
                className="input-field text-sm"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingProfile}
            className="btn-primary w-auto px-8 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>{loadingProfile ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
