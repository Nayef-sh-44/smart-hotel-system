import fs from 'fs';
let content = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf8');

// 1. Add validation in handleBookingSubmit
const target1 = `const handleBookingSubmit = async (e) => {
    e.preventDefault();`;
const replace1 = `const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (numGuests > selectedRoom.capacity * numRooms) {
      toast.error(\`Maximum capacity for \${numRooms} selected room(s) is \${selectedRoom.capacity * numRooms} guests.\`);
      return;
    }`;
content = content.replace(target1, replace1);

// 2. Add validation message to the UI
const target2 = `Number of Guests (Max: {selectedRoom.capacity * numRooms})`;
const replace2 = `Number of Guests`;
content = content.replace(target2, replace2);

const target3 = `onChange={(e) => setNumGuests(e.target.value)}
                        className="input-field text-xs"
                        required
                      />
                    </div>
                    <div>`;
const replace3 = `onChange={(e) => setNumGuests(e.target.value)}
                        className={\`input-field text-xs \${numGuests > selectedRoom.capacity * numRooms ? 'border-red-500' : ''}\`}
                        required
                      />
                      {numGuests > selectedRoom.capacity * numRooms && (
                        <p className="text-red-500 text-[10px] mt-1 font-medium">
                          Max capacity for {numRooms} room(s) is {selectedRoom.capacity * numRooms} guests.
                        </p>
                      )}
                    </div>
                    <div>`;
content = content.replace(target3, replace3);

// 3. Disable submit button if invalid
const target4 = `disabled={submittingBooking || nights <= 0}`;
const replace4 = `disabled={submittingBooking || nights <= 0 || numGuests > selectedRoom.capacity * numRooms}`;
content = content.replace(target4, replace4);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', content, 'utf8');
console.log("HotelDetail.jsx patched");
