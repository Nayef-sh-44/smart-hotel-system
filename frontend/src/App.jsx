import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ComparisonProvider } from './context/ComparisonContext.jsx';
import { RoleGuard, AuthGuard } from './components/RoleGuard.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import ComparisonDrawer from './components/ComparisonDrawer.jsx';

// Pages
import Hotels from './pages/Hotels.jsx';
import HotelDetail from './pages/HotelDetail.jsx';
import Compare from './pages/Compare.jsx';
import Favorites from './pages/Favorites.jsx';
import Loyalty from './pages/Loyalty.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ManagerPortal from './pages/ManagerPortal.jsx';
import AdminPortal from './pages/AdminPortal.jsx';
import TripCostCalculator from './pages/TripCostCalculator.jsx';

function AppContent() {
  const { user } = useAuth();
  
  // Only display the Customer UI (Navbar + Drawer) for unauthenticated visitors or actual customers (users)
  const showCustomerUI = !user || user.role === 'user';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {showCustomerUI && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Customer Routes (Unauthenticated + Customer) */}
          <Route path="/" element={<Navigate to="/hotels" replace />} />
          <Route path="/hotels" element={
            <RoleGuard allowedRoles={['user']} allowUnauthenticated={true}>
              <Hotels />
            </RoleGuard>
          } />
          <Route path="/hotels/:id" element={
            <RoleGuard allowedRoles={['user']} allowUnauthenticated={true}>
              <HotelDetail />
            </RoleGuard>
          } />

          {/* Protected Customer Routes (Customer ONLY) */}
          <Route path="/compare" element={
            <RoleGuard allowedRoles={['user']}>
              <Compare />
            </RoleGuard>
          } />
          <Route path="/favorites" element={
            <RoleGuard allowedRoles={['user']}>
              <Favorites />
            </RoleGuard>
          } />
          <Route path="/loyalty" element={
            <RoleGuard allowedRoles={['user']}>
              <Loyalty />
            </RoleGuard>
          } />
          <Route path="/trip-cost" element={
            <RoleGuard allowedRoles={['user']}>
              <TripCostCalculator />
            </RoleGuard>
          } />
          <Route path="/my-bookings" element={
            <RoleGuard allowedRoles={['user']}>
              <MyBookings />
            </RoleGuard>
          } />
          <Route path="/profile" element={
            <RoleGuard allowedRoles={['user']}>
              <Profile />
            </RoleGuard>
          } />

          {/* Authentication Routes (Unauthenticated ONLY) */}
          <Route path="/login" element={
            <AuthGuard>
              <Login />
            </AuthGuard>
          } />
          <Route path="/register" element={
            <AuthGuard>
              <Register />
            </AuthGuard>
          } />

          {/* Hotel Manager Portal (Manager ONLY) */}
          <Route path="/manager" element={
            <RoleGuard allowedRoles={['hotel_manager']}>
              <ManagerPortal />
            </RoleGuard>
          } />

          {/* System Admin Portal (Admin ONLY) */}
          <Route path="/admin" element={
            <RoleGuard allowedRoles={['system_admin']}>
              <AdminPortal />
            </RoleGuard>
          } />
          
          {/* Fallback for completely unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Comparison Bottom Drawer */}
      {showCustomerUI && <ComparisonDrawer />}

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <span>© {new Date().getFullYear()} SmartHotel Pro. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span>Powered by React 19, Vite & Node.js</span>
          </span>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ComparisonProvider>
          <AppContent />
        </ComparisonProvider>
      </AuthProvider>
    </Router>
  );
}
