 // if we were in 18 we wouldn't need it but we use native

async function run() {
    let r = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: 'Cap Tester', email: 'cap@example.com', password: 'Password123!', role: 'customer' }) });
    let data = await r.json();
    let token = data.data?.token;
    if(!token) {
        r = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'cap@example.com', password: 'Password123!' }) });
        data = await r.json();
        token = data.data.token;
    }
    
    const tryBooking = async (label, rooms, guests) => {
        r = await fetch('http://localhost:5000/api/bookings', { 
            method: 'POST', 
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, 
            // hotel 1, room 1 has capacity 2!
            body: JSON.stringify({ hotel_id: 1, room_id: 1, check_in_date: '2026-11-10', check_out_date: '2026-11-12', num_guests: guests, num_rooms: rooms }) 
        });
        const res = await r.json();
        console.log(`\nTEST: ${label} (Rooms: ${rooms}, Guests: ${guests})`);
        if (res.success) {
            console.log(`? SUCCESS (Booking Created)`);
            // cleanup
            await fetch(`http://localhost:5000/api/bookings/${res.data.id}/cancel`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token } });
        } else {
            console.log(`? REJECTED: ${res.error?.message} (Status: ${res.error?.status})`);
        }
    };

    // room 1 capacity is 2
    await tryBooking("A) 2 rooms * cap 2 + 6 guests -> MUST FAIL", 2, 6);
    await tryBooking("B) 2 rooms * cap 2 + 4 guests -> MUST PASS", 2, 4);
    await tryBooking("C) 1 room * cap 2 + 3 guests -> MUST FAIL", 1, 3);
    await tryBooking("D) 3 rooms * cap 2 + 6 guests -> MUST PASS", 3, 6);
    
}
run();
