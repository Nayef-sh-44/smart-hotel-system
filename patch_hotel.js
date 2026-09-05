const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/hotelController.js', 'utf8');

code = code.replace(
  'import { Op } from \'sequelize\';',
  'import { Op } from \'sequelize\';\nimport { calculatePricing } from \'../services/pricingService.js\';'
);

const previewMatch = code.match(/export const getPricePreview = async \(req, res, next\) => \{[^]*?\};\n/);
if (previewMatch) {
  const newPreview = `export const getPricePreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { room_id, check_in_date, check_out_date, num_rooms = 1 } = req.query;

    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, error: { message: 'Missing required parameters' } });
    }

    const checkInDate = new Date(check_in_date);
    const checkOutDate = new Date(check_out_date);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, error: { message: 'Invalid dates' } });
    }

    const room = await Room.findByPk(room_id, {
      include: [
        { model: Hotel, as: 'hotel', include: [
          { model: City, as: 'city' },
          { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
        ]},
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
      ]
    });

    if (!room || room.hotel_id !== Number(id)) {
      return res.status(404).json({ success: false, error: { message: 'Room not found in this hotel' } });
    }

    const pricingRules = await DynamicPricingRule.findAll({ where: { is_active: true } });
    
    const baseRoomPrice = Number(room.price_per_night);
    const country = room.hotel?.city?.country || '';
    const flashDeals = room.hotel?.flashDeals || room.flashDeals || [];

    const pricingData = calculatePricing(
      checkInDate,
      checkOutDate,
      baseRoomPrice,
      pricingRules,
      num_rooms,
      country,
      flashDeals
    );

    res.status(200).json({
      success: true,
      data: pricingData
    });

  } catch (error) {
    next(error);
  }
};
`;
  code = code.replace(previewMatch[0], newPreview);
}

fs.writeFileSync('backend/src/controllers/hotelController.js', code);
