import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useComparison } from '../context/ComparisonContext.jsx';
import {
  Hotel,
  Sparkles,
  Scale,
  Heart,
  Award,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Briefcase,
  ChevronDown,
  Sun,
  Moon,
  Calculator
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useComparison();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);



  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Hotels', path: '/hotels', icon: Hotel },
    { name: 'Compare', path: '/compare', icon: Scale, badge: count > 0 ? count : null },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Trip Cost', path: '/trip-cost', icon: Calculator },
    { name: 'Loyalty Rewards', path: '/loyalty', icon: Award },
  ];

  const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
  const isManager = user && (user.role === 'manager' || user.role === 'hotel_manager');

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-dark-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/hotels" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 dark:bg-gradient-to-tr dark:from-brand-600 dark:to-accent-500 flex items-center justify-center shadow-md dark:shadow-lg dark:shadow-brand-600/30 group-hover:shadow-lg dark:group-hover:shadow-brand-500/50 transition-all duration-300">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-brand-400 dark:bg-clip-text">
                SmartHotel Pro
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-brand-600 dark:text-brand-400 font-semibold">
                AI Luxury Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {link.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent-500 text-dark-950 text-xs font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">


            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/30 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {isManager && (
              <Link
                to="/manager"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>Manager Portal</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdown && (
                  <div
                    onClick={() => setUserDropdown(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Hotel className="w-4 h-4 text-brand-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <User className="w-4 h-4 text-brand-400" />
                      <span>Profile Settings</span>
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 text-left border-t border-slate-200 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-3">

            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-dark-950 border-b border-slate-200 dark:border-slate-800 shadow-xl py-4 px-4 flex flex-col gap-2 transition-colors duration-300">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-brand-400" />
                  <span>{link.name}</span>
                </div>
                {link.badge !== null && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-500 text-dark-950 text-xs font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Hotel className="w-5 h-5 text-brand-400" />
                  <span>My Bookings</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  <User className="w-5 h-5 text-brand-400" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
