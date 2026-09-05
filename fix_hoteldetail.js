const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

// 1. Add numRooms validation logic to handleBookingSubmit and handleAddToTrip
// Wait, handleAddToTrip already has rooms: Number(numRooms).
// But numRooms is not in the form! Let's find where numGuests is rendered.

const guestInputStr = `                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={numGuests}
                      onChange={(e) => setNumGuests(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>`;

// We will replace this with Guests + Rooms
const guestsAndRoomsStr = `                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
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
                      <button type="button" onClick={() => setNumRooms(Math.max(1, numRooms - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-600 hover:bg-slate-200">-</button>
                      <input
                        type="number"
                        min="1"
                        max={selectedRoom?.available_rooms || 1}
                        value={numRooms}
                        onChange={(e) => setNumRooms(Math.min(selectedRoom?.available_rooms, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="input-field text-xs text-center flex-1"
                        required
                        readOnly
                      />
                      <button type="button" onClick={() => setNumRooms(Math.min(selectedRoom?.available_rooms, numRooms + 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-600 hover:bg-slate-200">+</button>
                    </div>
                  </div>`;

if (code.includes(guestInputStr)) {
    code = code.replace(guestInputStr, guestsAndRoomsStr);
} else {
    // maybe it's slightly different
    console.log("Could not find guestInputStr exactly.");
    // Try regex
    code = code.replace(/<div>\s*<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\s*Number of Guests\s*<\/label>[\s\S]*?<\/div>/, guestsAndRoomsStr);
}


// 2. Fix Modal Buttons
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-colors"
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
    console.log("Could not find buttons to replace via regex.");
}

// Ensure the form uses num_rooms for standard booking!
// bookingService.create(...)
code = code.replace(/num_guests: Number\(numGuests\),/, `num_guests: Number(numGuests),\n            num_rooms: Number(numRooms),`);

// Ensure handleAddToTrip validates inventory
const handleAddRegex = /const handleAddToTrip = \(\) => \{/;
const handleAddReplacement = `const handleAddToTrip = () => {
    if (numRooms > selectedRoom?.available_rooms) {
      toast.error('Not enough available rooms.');
      return;
    }`;
code = code.replace(handleAddRegex, handleAddReplacement);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log("FIXED HOTEL DETAIL");
