const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

const targetStr = `              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Number of Guests (Max: {selectedRoom.capacity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom.capacity}
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  className="input-field text-xs"
                  required
                />
              </div>`;

const newStr = `              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Number of Guests (Max: {selectedRoom.capacity * numRooms})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom.capacity * numRooms}
                    value={numGuests}
                    onChange={(e) => setNumGuests(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex justify-between">
                    <span>Number of Rooms</span>
                    <span className="text-[10px] text-brand-500 font-bold">{selectedRoom?.available_rooms || 0} Available</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setNumRooms(Math.max(1, numRooms - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 text-slate-600 hover:bg-slate-200">-</button>
                    <input
                      type="number"
                      min="1"
                      max={selectedRoom?.available_rooms || 1}
                      value={numRooms}
                      onChange={(e) => setNumRooms(Math.min(selectedRoom?.available_rooms, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="input-field text-xs text-center flex-1 m-0"
                      required
                      readOnly
                    />
                    <button type="button" onClick={() => setNumRooms(Math.min(selectedRoom?.available_rooms, numRooms + 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 text-slate-600 hover:bg-slate-200">+</button>
                  </div>
                </div>
              </div>`;

code = code.replace(targetStr, newStr);

// Also need to check if the button replacement worked
const buttonsRegex = /<button\s*type="button"\s*onClick=\{\(\) => setBookingModalOpen\(false\)\}\s*className="btn-secondary text-xs"\s*>\s*Cancel\s*<\/button>\s*<button\s*type="submit"\s*disabled=\{submittingBooking \|\| nights <= 0\}\s*className="btn-primary text-xs"\s*>\s*\{submittingBooking \? 'Confirming\.\.\.' : 'Confirm Reservation'\}\s*<\/button>/;

const newButtons = `<button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToTrip}
                    disabled={nights <= 0 || numRooms > selectedRoom?.available_rooms}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    Add to Trip Plan
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking || nights <= 0 || numRooms > selectedRoom?.available_rooms}
                    className="btn-primary text-xs"
                  >
                    {submittingBooking ? 'Confirming...' : 'Confirm Reservation'}
                  </button>`;

if(code.match(buttonsRegex)) {
    code = code.replace(buttonsRegex, newButtons);
} else {
    // try a more loose string replacement
    const btnCancelStr = `                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>`;
    const btnConfirmStr = `                  <button
                    type="submit"
                    disabled={submittingBooking || nights <= 0}
                    className="btn-primary text-xs"
                  >
                    {submittingBooking ? 'Confirming...' : 'Confirm Reservation'}
                  </button>`;
    
    if (code.includes(btnCancelStr) && code.includes(btnConfirmStr)) {
        code = code.replace(btnCancelStr + '\n' + btnConfirmStr, newButtons);
    }
}

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log("FIXED HOTEL DETAIL 2");
