import fs from 'fs';
let content = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

const target1 = `if (validated.num_guests > newRoom.capacity) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: \`Room capacity exceeded. Max capacity is \${newRoom.capacity}\`, status: 400 } });
    }`;
const replace1 = `const currentNumRooms = booking.num_rooms || 1;
    if (validated.num_guests > newRoom.capacity * currentNumRooms) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { message: \`Room capacity exceeded. Max capacity for \${currentNumRooms} room(s) is \${newRoom.capacity * currentNumRooms}\`, status: 400 } });
    }`;

content = content.replace(target1, replace1);

// Double check if createBooking actually has the validation logic correct
// The existing validation in createBooking is:
// if (validated.num_guests > room.capacity * numRooms) { ... }
// Which is correct!

fs.writeFileSync('backend/src/controllers/bookingController.js', content, 'utf8');
console.log("bookingController.js patched");
