import fs from 'fs';
let content = fs.readFileSync('frontend/src/pages/MyBookings.jsx', 'utf8');

const target1 = `const res = await bookingService.update(editingId, {`;
const replace1 = `const selectedRoom = availableRooms.find(r => r.id === Number(editForm.room_id));
      const booking = bookings.find(b => b.id === editingId);
      const currentNumRooms = (booking && booking.special_requests) 
          ? (booking.special_requests.match(/\[(\d+)\s+Rooms/)?.[1] ? Number(booking.special_requests.match(/\[(\d+)\s+Rooms/)[1]) : 1)
          : 1;

      if (selectedRoom && Number(editForm.num_guests) > selectedRoom.capacity * currentNumRooms) {
        toast.error(\`Maximum capacity for \${currentNumRooms} selected room(s) is \${selectedRoom.capacity * currentNumRooms} guests.\`);
        return;
      }
      
      const res = await bookingService.update(editingId, {`;

content = content.replace(target1, replace1);

const target2 = `<input type="number" min="1" className="input-field text-sm p-2 w-full" value={editForm.num_guests} onChange={(e) => setEditForm({...editForm, num_guests: e.target.value})} />`;
const replace2 = `<input type="number" min="1" className="input-field text-sm p-2 w-full" value={editForm.num_guests} onChange={(e) => setEditForm({...editForm, num_guests: e.target.value})} />`;

fs.writeFileSync('frontend/src/pages/MyBookings.jsx', content, 'utf8');
console.log("MyBookings.jsx patched");
