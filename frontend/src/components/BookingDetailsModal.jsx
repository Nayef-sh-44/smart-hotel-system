import React from 'react';
import { X, Calendar, Users, Hotel as HotelIcon, CreditCard, CheckCircle, XCircle, Clock, MapPin, Sparkles, Award } from 'lucide-react';

export default function BookingDetailsModal({ booking, onClose, symbol, formatPrice }) {
  if (!booking) return null;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="badge bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-3 py-1 text-sm">
            <CheckCircle className="w-4 h-4 mr-1 inline" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-rose-500/10 text-rose-600 border border-rose-500/30 px-3 py-1 text-sm">
            <XCircle className="w-4 h-4 mr-1 inline" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="badge bg-amber-500/10 text-amber-600 border border-amber-500/30 capitalize px-3 py-1 text-sm">
            <Clock className="w-4 h-4 mr-1 inline" /> {status}
          </span>
        );
    }
  };

  const parseNumRooms = (specialRequests) => {
    if (!specialRequests) return 1;
    const match = specialRequests.match(/\[(\d+) Rooms Booked\]/);
    return match ? parseInt(match[1]) : 1;
  };

  const numRooms = parseNumRooms(booking.special_requests);
  const currency = booking.currency || booking.hotel?.currency || 'USD';
  
  const roomRate = Number(booking.room?.price_per_night || 0);
  const rawBasePrice = roomRate > 0 ? (roomRate * Number(booking.total_nights) * numRooms) : (Number(booking.total_price) - (Number(booking.tax_amount) || 0));
  
  const finalPreTax = Number(booking.total_price) - (Number(booking.tax_amount) || 0);
  const totalDiscount = Math.max(0, rawBasePrice - finalPreTax);

  // Extract loyalty points from transactions
  const earnedTx = booking.loyaltyTransactions?.find(tx => tx.transaction_type === 'earned');
  const redeemedTx = booking.loyaltyTransactions?.find(tx => tx.transaction_type === 'redeemed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mt-1">
              REF: {booking.booking_reference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Status & Overview Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              {getStatusBadge(booking.status)}
              <span className="text-sm font-medium text-slate-600">
                Booked on: {new Date(booking.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-500 uppercase">Final Total Paid</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {symbol}{formatPrice(booking.total_price, currency)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Hotel & Room */}
            <div className="space-y-6">
              
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Hotel Information</h3>
                <div className="flex gap-4">
                  {booking.hotel?.primary_image_url ? (
                    <img src={booking.hotel.primary_image_url} alt={booking.hotel.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                      <HotelIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">{booking.hotel?.name || `Hotel #${booking.hotel_id}`}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: booking.hotel?.star_rating || 0 }).map((_, i) => (
                        <Sparkles key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    {booking.hotel?.city && (
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {booking.hotel.city.name}, {booking.hotel.city.country}
                      </p>
                    )}
                    {booking.hotel?.address && (
                      <p className="text-sm text-slate-500 mt-1 pl-5.5">{booking.hotel.address}</p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Room & Stay Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      <HotelIcon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Room Type</p>
                      <p className="font-medium text-slate-900 capitalize">{booking.room?.room_type || 'Standard'} Suite</p>
                      {booking.room?.price_per_night && (
                        <p className="text-xs text-slate-500 mt-0.5">Price per night: {symbol}{formatPrice(booking.room.price_per_night, currency)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Check-in</p>
                        <p className="font-medium text-slate-900">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Check-out</p>
                        <p className="font-medium text-slate-900">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Guests</p>
                        <p className="font-medium text-slate-900">{booking.num_guests} Guest(s)</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Duration</p>
                        <p className="font-medium text-slate-900">{booking.total_nights} Night(s)</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Rooms</p>
                        <p className="font-medium text-slate-900">{numRooms} Room(s)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Pricing & Extra Info */}
            <div className="space-y-6">
              
              <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Pricing Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Price</span>
                    <span className="font-medium">{symbol}{formatPrice(rawBasePrice, currency)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-brand-600 bg-brand-50/50 p-2 rounded">
                      <span>Applied Discounts & Promos</span>
                      <span className="font-medium">-{symbol}{formatPrice(totalDiscount, currency)}</span>
                    </div>
                  )}
                  
                  {totalDiscount > 0 && (
                     <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
                        <span>Discounted Subtotal</span>
                        <span className="font-medium">{symbol}{formatPrice(finalPreTax, currency)}</span>
                     </div>
                  )}
                  
                  {booking.tax_amount != null && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Taxes & Fees (3%)</span>
                      <span className="font-medium">{symbol}{formatPrice(booking.tax_amount, currency)}</span>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="text-xl font-extrabold text-brand-600">{symbol}{formatPrice(booking.total_price, currency)}</span>
                  </div>
                </div>
              </section>

              {/* Loyalty Information */}
              {(earnedTx || redeemedTx) && (
                <section>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Loyalty Rewards</h3>
                  <div className="space-y-3">
                    {earnedTx && (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-800">Points Earned</span>
                        </div>
                        <span className="font-bold text-emerald-600">+{earnedTx.points} Pts</span>
                      </div>
                    )}
                    {redeemedTx && (
                      <div className="flex flex-col p-3 bg-brand-50 border border-brand-100 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand-500" />
                            <span className="text-sm font-medium text-brand-800">Reward Redeemed</span>
                          </div>
                          <span className="font-bold text-brand-600">{redeemedTx.points} Pts</span>
                        </div>
                        {redeemedTx.description && (
                          <span className="text-xs text-brand-700/80 ml-7">{redeemedTx.description}</span>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Additional Information */}
              {(booking.special_requests || booking.payment_status) && (
                <section>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Additional Information</h3>
                  <div className="space-y-3">
                    {booking.payment_status && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Payment Status: <strong className="capitalize">{booking.payment_status}</strong></span>
                      </div>
                    )}
                    {booking.special_requests && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-semibold block mb-1">Special Requests & Notes:</span>
                        <span className="italic text-slate-500 block break-words">{booking.special_requests}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 p-6 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold transition-all"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
