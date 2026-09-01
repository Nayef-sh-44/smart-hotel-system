import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Mail, Lock, ArrowRight } from 'lucide-react';

import { toast } from 'react-hot-toast';
import api from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login');
  const [forgotData, setForgotData] = useState({ email: '', q1: '', q2: '', a1: '', a2: '', new_password: '', confirm_password: '', reset_token: '' });

  const handleForgotChange = (e) => setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (view === 'forgot_email') {
      try {
        const res = await api.post('/auth/forgot-password', { email: forgotData.email });
        if (res.data?.success) {
          setForgotData(prev => ({ ...prev, q1: res.data.data.questions[0], q2: res.data.data.questions[1] }));
          setView('forgot_questions');
          toast.success(res.data.message || 'Please answer the questions');
        }
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Error occurred');
      }
    } else if (view === 'forgot_questions') {
      try {
        const res = await api.post('/auth/verify-answers', { email: forgotData.email, answer_1: forgotData.a1, answer_2: forgotData.a2 });
        if (res.data?.success) {
          setForgotData(prev => ({ ...prev, reset_token: res.data.data.reset_token }));
          setView('forgot_reset');
          toast.success('Answers verified!');
        }
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Invalid answers');
      }
    } else if (view === 'forgot_reset') {
      if (forgotData.new_password !== forgotData.confirm_password) {
        return toast.error('Passwords do not match');
      }
      try {
        const res = await api.post('/auth/reset-password', { email: forgotData.email, reset_token: forgotData.reset_token, new_password: forgotData.new_password });
        if (res.data?.success) {
          toast.success('Password changed successfully');
          setView('login');
        }
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Reset failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res && res.success) {
      if (res.role === 'system_admin') navigate('/admin');
      else if (res.role === 'hotel_manager') navigate('/manager');
      else navigate('/hotels');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-panel p-8 sm:p-10 max-w-md w-full relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

        {view === 'login' && (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
                <Hotel className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sign in to your SmartHotel Pro luxury account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => setView('forgot_email')} className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-4 text-sm font-semibold"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-400 font-semibold hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>
          </>
        )}

        {view === 'forgot_email' && (
          <div className="w-full">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
                <Hotel className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Forgot Password</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your email to recover your account</p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input type="email" name="email" required value={forgotData.email} onChange={handleForgotChange} placeholder="name@example.com" className="input-field text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full shadow-md py-3 text-sm">Continue</button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setView('login')} className="text-xs text-slate-400 hover:text-white transition-colors">Back to Login</button>
              </div>
            </form>
          </div>
        )}

        {view === 'forgot_questions' && (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Security Questions</h2>
              <p className="text-xs text-slate-400 mt-1">Answer the questions to verify your identity</p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{forgotData.q1}</label>
                <input type="text" name="a1" required value={forgotData.a1} onChange={handleForgotChange} placeholder="Answer 1" className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{forgotData.q2}</label>
                <input type="text" name="a2" required value={forgotData.a2} onChange={handleForgotChange} placeholder="Answer 2" className="input-field text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full shadow-md py-3 text-sm">Verify Answers</button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setView('login')} className="text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {view === 'forgot_reset' && (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Set New Password</h2>
              <p className="text-xs text-slate-400 mt-1">Choose a new strong password</p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                <input type="password" name="new_password" required value={forgotData.new_password} onChange={handleForgotChange} placeholder="********" className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                <input type="password" name="confirm_password" required value={forgotData.confirm_password} onChange={handleForgotChange} placeholder="********" className="input-field text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full shadow-md py-3 text-sm">Reset Password</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
