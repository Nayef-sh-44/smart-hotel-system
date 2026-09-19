import { Hotel, Booking, Room } from './backend/src/models/index.js';

async function testOccupancy(hotelId, startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    
    const bookings = await Booking.findAll({ where: { hotel_id: hotelId, status: 'confirmed' } });
    
    let bookedNights = 0;
    bookings.forEach(b => {
        const bIn = new Date(b.check_in_date).getTime();
        const bOut = new Date(b.check_out_date).getTime();
        const pIn = startDate.getTime();
        const pOut = endDate.getTime();
        
        const overlapStart = Math.max(bIn, pIn);
        const overlapEnd = Math.min(bOut, pOut);
        
        if (overlapEnd > overlapStart) {
            const overlapDays = (overlapEnd - overlapStart) / (1000 * 3600 * 24);
            bookedNights += (overlapDays * (b.num_rooms || 1));
        }
    });

    const hotel = await Hotel.findByPk(hotelId, { include: [{ model: Room, as: 'rooms' }] });
    const totalRooms = hotel.rooms ? hotel.rooms.reduce((sum, r) => sum + (r.available_rooms || 1), 0) : 1;
    const occupancy = totalRooms > 0 ? Math.min(100, (bookedNights / (totalRooms * periodDays)) * 100) : 0;
    
    console.log(`Period: ${startDateStr} to ${endDateStr} => Occupancy: ${occupancy.toFixed(1)}%`);
}

async function run() {
    await testOccupancy(1, '2026-06-01', '2026-06-30');
    await testOccupancy(1, '2026-09-01', '2026-09-30');
    await testOccupancy(1, '2026-12-01', '2026-12-31');
}

run().catch(console.error).finally(() => process.exit(0));
