const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/ManagerPortal.jsx', 'utf8');

const target = `                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Base Price / Night (€)
                      </label>
                      <input
                        type="number"
                        value={myHotel.base_price_per_night || ''}
                        onChange={(e) =>
                          setMyHotel({ ...myHotel, base_price_per_night: e.target.value })
                        }
                        className="input-field text-xs"
                      />
                    </div>`;

c = c.replace(target, '');
fs.writeFileSync('frontend/src/pages/ManagerPortal.jsx', c);
