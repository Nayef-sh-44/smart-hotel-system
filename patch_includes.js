const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

// Patch createBooking findByPk
const oldCreateRoomInclude = `    const room = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [{ model: City, as: 'city' }]
        }
      ],
      transaction
    });`;

const newCreateRoomInclude = `    const room = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [
            { model: City, as: 'city' },
            { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
          ]
        },
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
      ],
      transaction
    });`;

code = code.replace(oldCreateRoomInclude, newCreateRoomInclude);

// Patch updateBooking findByPk
const oldUpdateRoomInclude = `    let newRoom = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [{ model: City, as: 'city' }]
        }
      ],
      transaction
    });`;

const newUpdateRoomInclude = `    let newRoom = await Room.findByPk(validated.room_id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [
            { model: City, as: 'city' },
            { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
          ]
        },
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
      ],
      transaction
    });`;

code = code.replace(oldUpdateRoomInclude, newUpdateRoomInclude);

fs.writeFileSync('backend/src/controllers/bookingController.js', code);
console.log('patched booking includes');
