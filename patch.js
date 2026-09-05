const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');
const startIdx = code.indexOf('const calculateDynamicPrice =');
const endIdx = code.indexOf('export const createBooking =');
const newFunc = `const calculateDynamicPrice = (checkInStr, checkOutStr, baseRoomPrice, pricingRules, numRooms = 1, country = '', flashDeals = []) => {
  const nightlyBreakdown = [];
  let calculatedBasePrice = 0;
  const checkInDate = new Date(checkInStr);
  const checkOutDate = new Date(checkOutStr);
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

    let nightlyBase = baseRoomPrice * dailyMultiplier * numRooms;
    let nightlyFinal = nightlyBase;

    if (activeDeal) {
      if (activeDeal.discount_type === 'percentage') {
        nightlyFinal -= nightlyFinal * (Number(activeDeal.discount_percentage) / 100);
      } else {
        nightlyFinal -= (Number(activeDeal.discount_value) * numRooms);
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

  return { totalPrice: Number(calculatedBasePrice.toFixed(2)), nightlyBreakdown };
};

`;
code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);

const call1 = `    let total_price = calculateDynamicPrice(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country
    );`;

const call1New = `    let { totalPrice: total_price, nightlyBreakdown } = calculateDynamicPrice(
      validated.check_in_date,
      validated.check_out_date,
      baseRoomPrice,
      pricingRules,
      numRooms,
      room.hotel?.city?.country,
      room.hotel?.flashDeals || room.flashDeals || []
    );`;

code = code.replace(call1, call1New);

const call2 = `      let newBasePrice = calculateDynamicPrice(
        validated.check_in_date,
        validated.check_out_date,
        Number(newRoom.price_per_night),
        pricingRules,
        booking.num_rooms || 1,
        newRoom.hotel?.city?.country
      );`;

const call2New = `      let { totalPrice: newBasePrice, nightlyBreakdown: newBreakdown } = calculateDynamicPrice(
        validated.check_in_date,
        validated.check_out_date,
        Number(newRoom.price_per_night),
        pricingRules,
        booking.num_rooms || 1,
        newRoom.hotel?.city?.country,
        newRoom.hotel?.flashDeals || newRoom.flashDeals || []
      );`;

code = code.replace(call2, call2New);

fs.writeFileSync('backend/src/controllers/bookingController.js', code);
console.log('done');
