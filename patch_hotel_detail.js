const fs = require('fs');
const file = 'frontend/src/pages/HotelDetail.jsx';
let code = fs.readFileSync(file, 'utf-8');

// Import useTrip
code = code.replace(/import \{ useComparison \} from '..\/context\/ComparisonContext.jsx';/, "import { useComparison } from '../context/ComparisonContext.jsx';\nimport { useTrip } from '../context/TripContext.jsx';");

// Get useTrip hook inside component
code = code.replace(/const \{ selected, toggleSelection \} = useComparison\(\);/, "const { selected, toggleSelection } = useComparison();\n  const { addDestination } = useTrip();");

// Add numRooms state
code = code.replace(/const \[numGuests, setNumGuests\] = useState\(1\);/, "const [numGuests, setNumGuests] = useState(1);\n  const [numRooms, setNumRooms] = useState(1);");

// Add handleAddToTrip
const addToTripFn = `
  const handleAddToTrip = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates first.');
      return;
    }
    if (!selectedRoom) {
      toast.error('Please select a room suite first.');
      return;
    }
    addDestination({
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      roomId: selectedRoom.id,
      roomName: selectedRoom.room_type,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(numGuests),
      rooms: Number(numRooms),
      tripType: tripType
    });
    toast.success('Added to Trip Plan!');
    navigate('/trip-cost');
  };
`;
code = code.replace(/const handleBookingSubmit = async \(e\) => {/, addToTripFn + '\n  const handleBookingSubmit = async (e) => {');

// Add "Add to Trip" button next to Compare button
const tripBtn = `
              <button
                onClick={handleAddToTrip}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-800/60"
              >
                <Banknote className="w-4 h-4" />
                <span>Add to Trip</span>
              </button>
`;
code = code.replace(/<button\s*onClick=\{() => toggleSelection\(hotel\)\}\s*className=\{`flex items-center gap-2 px-3 py-1\.5 rounded-lg text-sm font-semibold transition-all duration-200 border/, tripBtn + '\n              <button\n                onClick={$1 => toggleSelection(hotel)}\n                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 border');

// Add numRooms input to Booking form
const numRoomsInput = `
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={numRooms}
                      onChange={(e) => setNumRooms(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>
`;
code = code.replace(/<div>\s*<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\s*Number of Guests\s*<\/label>\s*<input\s*type="number"\s*min="1"\s*value=\{numGuests\}\s*onChange=\{\(e\) => setNumGuests\(e\.target\.value\)\}\s*className="input-field text-xs"\s*required\s*\/>\s*<\/div>/, numRoomsInput + '\n                  <div>\n                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">\n                      Number of Guests\n                    </label>\n                    <input\n                      type="number"\n                      min="1"\n                      value={numGuests}\n                      onChange={(e) => setNumGuests(e.target.value)}\n                      className="input-field text-xs"\n                      required\n                    />\n                  </div>');


fs.writeFileSync(file, code);
console.log("PATCHED HOTEL DETAIL");
