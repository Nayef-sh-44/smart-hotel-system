import React, { useState, useEffect } from 'react';
import { loyaltyService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Award,
  Sparkles,
  Gift,
  History,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';

export default function Loyalty() {
  const { isAuthenticated } = useAuth();
  const { symbol, formatPrice } = useCurrency();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await loyaltyService.getMyLoyalty();
      if (res.success) {
        setLoyaltyData(res.data);
      }
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, [isAuthenticated]);

  const handleRedeem = async (rewardId, pointsCost) => {
    if (loyaltyData?.points < pointsCost) {
      toast.error('Insufficient loyalty points for this reward.');
      return;
    }
    setRedeeming(true);
    try {
      const res = await loyaltyService.redeemReward(rewardId);
      if (res.success) {
        toast.success(res.message || 'Reward redeemed successfully!');
        fetchLoyalty();
      }
    } catch (err) {
      toast.error(err.error?.message || 'Failed to redeem reward.');
    } finally {
      setRedeeming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center glass-panel p-8">
          <Award className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign in to Loyalty Club</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Join our loyalty program to earn 10 points for every {symbol}10 spent and unlock exclusive luxury rewards.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    points = 0,
    tier = 'Silver',
    rewards = [],
    transactions = [],
  } = loyaltyData || {};

  const getTierColor = (t) => {
    switch (t.toLowerCase()) {
      case 'platinum':
        return 'from-purple-500 to-indigo-500 text-white shadow-purple-500/30';
      case 'gold':
        return 'from-amber-500 to-yellow-400 text-dark-950 shadow-amber-500/30';
      default:
        return 'from-slate-400 to-slate-200 text-dark-950 shadow-slate-400/30';
    }
  };

  const nextTierPoints =
    tier === 'Silver' ? 1000 : tier === 'Gold' ? 5000 : 5000;
  const progressPercent = Math.min(100, (points / nextTierPoints) * 100);

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-12 pb-10 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>SmartHotel Rewards Club</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Loyalty Rewards & Benefits
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Earn 10 points for every {symbol}10 spent on hotel reservations.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Tier Summary Card */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-white to-slate-50 dark:from-dark-900 dark:to-dark-950 border-slate-200 dark:border-brand-500/30">
          <div className="flex items-center gap-6">
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${getTierColor(
                tier
              )} flex items-center justify-center shadow-xl shrink-0`}
            >
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold block">
                Current Status
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">{tier} Member</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tier === 'Platinum'
                  ? 'You have reached the highest tier! Enjoy complimentary upgrades.'
                  : `${Math.max(0, nextTierPoints - points)} points until next VIP tier`}
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/80 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Points</span>
              <span className="text-2xl font-extrabold text-brand-400">{points}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-brand-500 to-accent-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block text-right">
              {tier === 'Platinum' ? 'Max VIP Tier' : `${Math.round(progressPercent)}% to next level`}
            </span>
          </div>
        </div>

        {/* Available Rewards Grid */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent-500" />
            <span>Redeemable Rewards</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((rew) => {
              const canAfford = points >= rew.points_cost;
              return (
                <div key={rew.id} className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {rew.reward_type}
                      </span>
                      <span className="text-sm font-extrabold text-amber-400">
                        {rew.points_cost} Pts
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {rew.reward_type === 'fixed_discount' 
                        ? `${symbol}${formatPrice(rew.reward_value)} Fixed Discount` 
                        : rew.reward_name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {rew.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRedeem(rew.id, rew.points_cost)}
                    disabled={!canAfford || redeeming}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      canAfford
                        ? 'btn-accent'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700/60 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem Reward' : 'Not enough points'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-panel p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <span>Points Transaction History</span>
          </h3>

          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/80 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block capitalize">
                      {tx.transaction_type}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {tx.description || 'Loyalty activity'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-extrabold text-sm ${
                        tx.points >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.points >= 0 ? `+${tx.points}` : tx.points} Pts
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
