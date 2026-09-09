const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const target = /const rawPrice = Number\(selectedRoom\.price_per_night\) \* Math\.max\(1, nights\);[\s\S]+?<span>\{nights\} Night\{nights > 1 \? 's' : ''\}<\/span>\s+<\/div>/;

const replacement = `if (fetchingPrice) {
                    return <div className="p-4 text-center text-xs text-slate-500">Calculating dynamic price...</div>;
                  }
                  
                  if (!pricePreview) {
                    return <div className="p-4 text-center text-xs text-red-500">Could not fetch price.</div>;
                  }

                  const rawPrice = pricePreview.totalPrice;
                  let discount = 0;
                  if (pendingReward && pendingReward.reward && applyReward) {
                    if (pendingReward.reward.reward_type === 'percentage_discount') {
                      discount = rawPrice * (Number(pendingReward.reward.reward_value) / 100);
                    } else {
                      discount = Number(pendingReward.reward.reward_value);
                    }
                  }
                  const baseDiscounted = Math.max(0, rawPrice - discount);
                  const taxes = baseDiscounted * 0.03;
                  const finalTotal = baseDiscounted + taxes;
  
                  return (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
                      {pricePreview.activeDeal && (
                        <div className="text-emerald-500 font-bold mb-2">
                          Flash Deal Applied: {pricePreview.activeDeal.title}
                        </div>
                      )}
                      
                      {pricePreview.nightlyBreakdown.map((night, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300 ml-2">
                          <span>{night.date} ({night.dayType}, {night.season})</span>
                          <span>
                            {night.multiplier !== 1 && <span className="text-emerald-500 mr-2 text-[10px]">x{night.multiplier.toFixed(2)}</span>}
                            {symbol}{formatPrice(night.final_price)}
                          </span>
                        </div>
                      ))}

                      <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                        <span>Total ({nights} Night{nights > 1 ? 's' : ''})</span>
                        <span>{symbol}{formatPrice(rawPrice)}</span>
                      </div>`;

c = c.replace(target, replacement);
fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', c);
