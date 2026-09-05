const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HotelDetail.jsx', 'utf-8');

// Replace handleAddToTrip
const oldHandlerRegex = /const handleAddToTrip = \(\) => \{[\s\S]*?toast\.success\('Added to Trip Plan!'\);\s*navigate\('\/trip-plan'\);\s*\};/m;

const newHandler = `const handleAddToTrip = () => {
    console.log("[TRIP DEBUG] ADD TO TRIP CLICKED");

    if (!selectedRoom) {
      toast.error("Please select a room suite first");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (!numGuests || numGuests < 1) {
      toast.error("Please enter number of guests");
      return;
    }

    if (!numRooms || numRooms < 1) {
      toast.error("Please select number of rooms");
      return;
    }

    if (selectedRoom.available_rooms != null && numRooms > selectedRoom.available_rooms) {
      toast.error("Not enough rooms available");
      return;
    }

    const destination = {
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
    };

    console.log("[TRIP DEBUG] DESTINATION:", destination);

    addDestination(destination);

    console.log("[TRIP DEBUG] DESTINATION ADDED");

    navigate("/trip-plan");
  };`;

code = code.replace(oldHandlerRegex, newHandler);

// Replace button HTML
const oldButtonRegex = /<button\s*type="button"\s*onClick=\{handleAddToTrip\}\s*disabled=\{nights <= 0 \|\| numRooms > selectedRoom\?\.available_rooms\}\s*className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-colors"\s*>\s*Add to Trip Plan\s*<\/button>/m;

const newButton = `<button
                      type="button"
                      onClick={handleAddToTrip}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-colors"
                    >
                      Add to Trip Plan
                    </button>`;

code = code.replace(oldButtonRegex, newButton);

fs.writeFileSync('frontend/src/pages/HotelDetail.jsx', code);
console.log("Replaced handleAddToTrip and Button");
