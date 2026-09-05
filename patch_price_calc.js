const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

const oldCalcBlock = `const rawPrice = Number(selectedRoom.price_per_night) * Math.max(1, nights);
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
                const finalTotal = baseDiscounted + taxes;`;

const newCalcBlock = `const rawPrice = pricePreview ? pricePreview.totalPrice : (Number(selectedRoom.price_per_night) * Math.max(1, nights));
                let discount = 0;
                if (pendingReward && pendingReward.reward && applyReward) {
                  if (pendingReward.reward.reward_type === 'percentage_discount') {
                    discount = rawPrice * (Number(pendingReward.reward.reward_value) / 100);
                  } else {
                    discount = Number(pendingReward.reward.reward_value);
                  }
                }
                const baseDiscounted = Math.max(0, rawPrice - discount);
                const taxes = pricePreview && !discount ? pricePreview.taxAmount : (baseDiscounted * 0.03);
                const finalTotal = pricePreview && !discount ? pricePreview.finalTotal : (baseDiscounted + taxes);`;

code = code.replace(oldCalcBlock, newCalcBlock);

const oldPriceRender = `<div className="flex justify-between text-slate-300">
                      <span>Room Rate ({selectedRoom.room_type})</span>
                      <span>{symbol}{formatPrice(selectedRoom.price_per_night)} / night</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Nights</span>
                      <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                    </div>`;

const newPriceRender = `
                    {isPriceLoading && <div className="text-center text-slate-400 py-2">Calculating prices...</div>}
                    {!isPriceLoading && pricePreview && pricePreview.nightlyBreakdown && pricePreview.nightlyBreakdown.length > 0 && (
                      <div className="mb-4">
                        <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">Nightly Breakdown:</div>
                        {pricePreview.nightlyBreakdown.map((night, i) => (
                           <div key={i} className="flex justify-between text-slate-400 py-0.5">
                             <span>{night.date} {night.multiplier !== 1 ? \`(x\${night.multiplier})\` : ''}</span>
                             <span>
                               {night.base_price !== night.final_price && <span className="line-through text-slate-500 mr-2">{symbol}{formatPrice(night.base_price)}</span>}
                               {symbol}{formatPrice(night.final_price)}
                             </span>
                           </div>
                        ))}
                      </div>
                    )}
                    {pricePreview && pricePreview.activeDeal && (
                      <div className="flex justify-between text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                        <span>Flash Deal: {pricePreview.activeDeal.title}</span>
                        <span>-{pricePreview.activeDeal.percentage}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300 mt-2">
                      <span>Base Total ({nights} Night{nights > 1 ? 's' : ''})</span>
                      <span>{symbol}{formatPrice(rawPrice)}</span>
                    </div>`;

code = code.replace(oldPriceRender, newPriceRender);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log('patched price calc');
