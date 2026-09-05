const fs = require('fs');
const file = 'frontend/src/pages/HotelDetail.jsx';
let code = fs.readFileSync(file, 'utf-8');

// 1. Remove the old Add to Trip button near the Compare button
const oldTripBtn = `              <button
                onClick={handleAddToTrip}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-800/60"
              >
                <Banknote className="w-4 h-4" />
                <span>Add to Trip</span>
              </button>`;

code = code.replace(oldTripBtn + '\n', '');

// 2. Add the button in the Booking modal
const modalButtonsOriginal = `                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking || nights <= 0}
                    className="btn-primary text-xs"
                  >
                    {submittingBooking ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>`;

const modalButtonsNew = `                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToTrip}
                    disabled={nights <= 0}
                    className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Add to Trip Plan
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking || nights <= 0}
                    className="btn-primary text-xs"
                  >
                    {submittingBooking ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>`;

code = code.replace(modalButtonsOriginal, modalButtonsNew);

// 3. Change "Book Room" text in room list to "Book / Add to Trip"
code = code.replace(/<span>Book Room<\/span>/g, '<span>Book / Add to Trip</span>');

fs.writeFileSync(file, code);
console.log("PATCHED MODAL BUTTONS");
