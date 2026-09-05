export const toDateSafe = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const calculatePricing = (checkInDateRaw, checkOutDateRaw, baseRoomPrice, pricingRules = [], numRooms = 1, country = '', flashDeals = []) => {
  const nightlyBreakdown = [];
  let calculatedBasePrice = 0;

  const checkInDate = toDateSafe(checkInDateRaw);
  const checkOutDate = toDateSafe(checkOutDateRaw);
  
  if (!checkInDate || !checkOutDate) {
    throw new Error("Invalid dates provided to calculatePricing");
  }

  // ensure dates are UTC
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

    let nightlyBase = baseRoomPrice * dailyMultiplier * Number(numRooms);
    let nightlyFinal = nightlyBase;

    if (activeDeal) {
      if (activeDeal.discount_type === 'percentage') {
        nightlyFinal -= nightlyFinal * (Number(activeDeal.discount_percentage) / 100);
      } else {
        nightlyFinal -= (Number(activeDeal.discount_value) * Number(numRooms));
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

  return {
    totalPrice,
    taxAmount,
    finalTotal,
    nightlyBreakdown,
    activeDeal: activeDeal ? { title: activeDeal.title, percentage: activeDeal.discount_percentage, value: activeDeal.discount_value } : null
  };
};
