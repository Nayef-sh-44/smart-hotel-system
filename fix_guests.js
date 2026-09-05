const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

const regex = /<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\s*Number of Guests \(Max: \{selectedRoom\.capacity\}\)\s*<\/label>\s*<input\s*type="number"\s*min="1"\s*max=\{selectedRoom\.capacity\}\s*value=\{numGuests\}\s*onChange=\{\(e\) => setNumGuests\(e\.target\.value\)\}\s*className="input-field text-xs"\s*required\s*\/>/m;

const newStr = `<div className="grid grid-cols-2 gap-4">
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

if(code.match(regex)) {
    code = code.replace(regex, newStr);
    console.log("SUCCESSFULLY REPLACED GUESTS/ROOMS");
} else {
    console.log("REGEX DID NOT MATCH");
}

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
