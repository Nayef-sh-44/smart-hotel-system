const fs = require('fs');

// Add endpoint to hotelRoutes.js
let routes = fs.readFileSync('backend/src/routes/hotelRoutes.js', 'utf8');
if (!routes.includes('getPricePreview')) {
  routes = routes.replace(
    `import { getAllHotels, getHotelById, addHotel } from '../controllers/hotelController.js';`,
    `import { getAllHotels, getHotelById, addHotel, getPricePreview } from '../controllers/hotelController.js';`
  );
  routes = routes.replace(
    `router.get('/:id', getHotelById);`,
    `router.get('/:id/price-preview', getPricePreview);\nrouter.get('/:id', getHotelById);`
  );
  fs.writeFileSync('backend/src/routes/hotelRoutes.js', routes);
}

// Add controller method to hotelController.js
let controller = fs.readFileSync('backend/src/controllers/hotelController.js', 'utf8');
if (!controller.includes('export const getPricePreview')) {
  const newFunc = `
export const getPricePreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { room_id, check_in_date, check_out_date, num_rooms = 1, user_currency = 'USD' } = req.query;

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
    
    // Copy the calculateDynamicPrice logic exactly
    const flashDeals = room.hotel?.flashDeals || room.flashDeals || [];
    const baseRoomPrice = Number(room.price_per_night);
    const country = room.hotel?.city?.country || '';

    const nightlyBreakdown = [];
    let calculatedBasePrice = 0;
    let currentDate = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()));
    const endDate = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate()));

    const now = new Date();
    let activeDeal = null;
    if (flashDeals && flashDeals.length > 0) {
      for (const deal of flashDeals) {
        if (deal.active_status) {
          const start = new Date(deal.start_datetime);
          const end = new Date(deal.end_datetime);
          if (now >= start && now <= end) {
            activeDeal = deal;
            break;
          }
        }
      }
    }

    const getSeason = (date, countryName) => {
      const month = date.getUTCMonth() + 1;
      const southernHemisphereCountries = ['Australia', 'Brazil', 'South Africa', 'Argentina', 'New Zealand', 'Chile', 'Peru', 'Uruguay', 'Fiji', 'Papua New Guinea'];
      const isSouthern = southernHemisphereCountries.includes(countryName);
      if (month >= 6 && month <= 8) return isSouthern ? 'Winter' : 'Summer';
      if (month === 12 || month <= 2) return isSouthern ? 'Summer' : 'Winter';
      if (month >= 3 && month <= 5) return isSouthern ? 'Autumn' : 'Spring';
      return isSouthern ? 'Spring' : 'Autumn';
    };

    const getDayType = (date) => {
      const day = date.getUTCDay();
      if (day === 4 || day === 5 || day === 6 || day === 0) return 'Peak';
      return 'Normal';
    };

    while (currentDate < endDate) {
      const season = getSeason(currentDate, country);
      const dayType = getDayType(currentDate);
      let dailyMultiplier = 1.0;

      if (pricingRules && pricingRules.length > 0) {
        pricingRules.forEach((r) => {
          if (r.rule_type === 'season' && r.rule_target === season) {
            dailyMultiplier *= Number(r.multiplier);
          } else if (r.rule_type === 'day_type' && r.rule_target === dayType) {
            dailyMultiplier *= Number(r.multiplier);
          }
        });
      }

      let nightlyBase = baseRoomPrice * dailyMultiplier * Number(num_rooms);
      let nightlyFinal = nightlyBase;

      if (activeDeal) {
        if (activeDeal.discount_type === 'percentage') {
          nightlyFinal -= nightlyFinal * (Number(activeDeal.discount_percentage) / 100);
        } else {
          nightlyFinal -= (Number(activeDeal.discount_value) * Number(num_rooms));
        }
        nightlyFinal = Math.max(0, nightlyFinal);
      }

      nightlyBreakdown.push({
        date: currentDate.toISOString().split('T')[0],
        base_price: Number(nightlyBase.toFixed(2)),
        final_price: Number(nightlyFinal.toFixed(2)),
        season,
        dayType,
        multiplier: dailyMultiplier
      });

      calculatedBasePrice += nightlyFinal;
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const totalPrice = Number(calculatedBasePrice.toFixed(2));
    const taxAmount = Number((totalPrice * 0.03).toFixed(2));
    const finalTotal = Number((totalPrice + taxAmount).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        totalPrice,
        taxAmount,
        finalTotal,
        nightlyBreakdown,
        activeDeal: activeDeal ? { title: activeDeal.title, percentage: activeDeal.discount_percentage, value: activeDeal.discount_value } : null
      }
    });

  } catch (error) {
    next(error);
  }
};
`;
  controller += newFunc;
  fs.writeFileSync('backend/src/controllers/hotelController.js', controller);
}
console.log('patched preview');
