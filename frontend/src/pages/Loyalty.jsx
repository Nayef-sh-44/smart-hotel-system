import React, { useState, useEffect } from 'react';
import { Award, History, Gift, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { loyaltyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Loyalty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalances();
    }
  }, [user]);

  const fetchBalances = async () => {
    try {
      const res = await loyaltyService.getMyBalances();
      if (res.success) {
        setBalances(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (hotelId) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
      return;
    }
    setExpandedHotel(hotelId);
    if (!hotelDetails[hotelId]) {
      setLoadingDetails(true);
      try {
        const res = await loyaltyService.getLoyaltyForHotel(hotelId);
        if (res.success) {
          setHotelDetails(prev => ({ ...prev, [hotelId]: res.data }));
        }
      } catch (error) {
        console.error('Failed to fetch hotel loyalty details:', error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center p-8 bg-slate-50 dark:bg-dark-900 rounded-2xl max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-800">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in Required</h2>
          <p className="text-sm text-slate-500 mb-6">Please log in to view your hotel-specific loyalty balances.</p>
          <Link to="/login" className="btn-primary w-full inline-flex justify-center">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <section className="pt-12 pb-10 border-b border-slate-200 dark:border-slate-800/80 bg-hero-glow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>SmartHotel Rewards Club</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            My Hotel Loyalty Balances
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Points are earned and redeemed independently per hotel.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : balances.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No balances yet</h3>
            <p className="text-sm text-slate-500 mt-2">Book a stay to start earning points at specific hotels!</p>
          </div>
        ) : (
          balances.map(balance => {
            const hotelName = balance.hotel?.name || 'Unknown Hotel';
            const isExpanded = expandedHotel === balance.hotel_id;
            const details = hotelDetails[balance.hotel_id];

            return (
              <div key={balance.hotel_id} className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div 
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors"
                  onClick={() => handleExpand(balance.hotel_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{hotelName}</h3>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block uppercase">
                        {balance.level?.name || 'Silver'} Member
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="block text-xs text-slate-500 mb-0.5">Points Balance</span>
                      <span className="text-xl font-extrabold text-brand-500">{balance.current_points}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/20 p-5 sm:p-6">
                    {loadingDetails && !details ? (
                      <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : details ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Rewards */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-accent-500" /> Available Rewards
                          </h4>
                          {details.rewards?.length === 0 ? (
                            <p className="text-xs text-slate-500">No rewards available for this hotel yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {details.rewards?.map(rew => (
                                <div key={rew.id} className="bg-white dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                                  <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
                                    <span>{rew.title}</span>
                                    <span className="text-amber-500">{rew.points_cost} Pts</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mb-3">{rew.description}</p>
                                  <button
                                    disabled={balance.current_points < rew.points_cost}
                                    onClick={() => navigate(`/hotels/${balance.hotel_id}?reward=${rew.id}`)}
                                    className={`w-full text-xs font-semibold py-1.5 rounded transition-colors ${
                                      balance.current_points >= rew.points_cost
                                        ? 'bg-brand-500 hover:bg-brand-600 text-white cursor-pointer'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    Redeem via Booking Page
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* History */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-brand-400" /> Recent Transactions
                          </h4>
                          {details.transactions?.length === 0 ? (
                            <p className="text-xs text-slate-500">No transactions recorded.</p>
                          ) : (
                            <div className="space-y-2">
                              {details.transactions?.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                                  <div>
                                    <span className="font-semibold block capitalize text-slate-700 dark:text-slate-300">{tx.transaction_type}</span>
                                    <span className="text-slate-500 text-[10px]">{new Date(tx.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <span className={`font-bold ${tx.points >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx.points > 0 ? '+' : ''}{tx.points}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500">Error loading details.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
