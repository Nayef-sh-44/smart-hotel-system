import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, User, Mail, Lock, Phone, ArrowRight, ShieldQuestion } from 'lucide-react';
import toast from 'react-hot-toast';

const SECURITY_QUESTIONS = [
  "What is your city?",
  "What is your favorite color?",
  "What was the name of your first pet?",
  "What is your favorite food?"
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    preferred_currency: 'EUR',
    security_question_1: '',
    security_answer_1: '',
    security_question_2: '',
    security_answer_2: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.security_question_1 || !formData.security_answer_1.trim() || 
        !formData.security_question_2 || !formData.security_answer_2.trim()) {
      toast.error('Please select both questions and provide answers.', { id: 'reg-sec' });
      return;
    }
    if (formData.security_question_1 === formData.security_question_2) {
      toast.error('You cannot select the same question twice.', { id: 'reg-sec-dup' });
      return;
    }

    setLoading(true);
    const res = await register(formData);
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
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Hotel className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="Jane Doe" className="input-field pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="input-field pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-field pl-10 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+1 234 567 89" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
              <select name="preferred_currency" value={formData.preferred_currency} onChange={handleChange} className="input-field text-sm">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <ShieldQuestion className="w-4 h-4 text-brand-500" />
              Password Recovery Questions
            </h3>
            
            <div className="space-y-3">
              <div>
                <select name="security_question_1" value={formData.security_question_1} onChange={handleChange} className="input-field text-sm mb-1" required>
                  <option value="" disabled>Select a question</option>
                  {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input type="text" name="security_answer_1" value={formData.security_answer_1} onChange={handleChange} placeholder="Answer" className="input-field text-sm" required />
              </div>
              
              <div>
                <select name="security_question_2" value={formData.security_question_2} onChange={handleChange} className="input-field text-sm mb-1" required>
                  <option value="" disabled>Select a question</option>
                  {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input type="text" name="security_answer_2" value={formData.security_answer_2} onChange={handleChange} placeholder="Answer" className="input-field text-sm" required />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 text-sm font-semibold">
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account? <Link to="/login" className="text-brand-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
