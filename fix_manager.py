import re

with open('backend/src/controllers/managerController.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('export const getCompetitorBenchmarking')
end = content.find('export const', start + 1)
if end == -1: end = len(content)

old_func = content[start:end]

new_func = '''export const getCompetitorBenchmarking = async (req, res, next) => {
  try {
    if (!req.user.hotel_id) {
      return res.status(404).json({
        success: false,
        error: { message: 'You do not have an assigned hotel.', status: 404 },
      });
    }

    const { start_date, end_date } = req.query;
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    }
    
    // Ensure endDate is after startDate
    if (endDate <= startDate) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));

    const myHotel = await Hotel.findByPk(req.user.hotel_id, {
      include: [
        { model: City, as: 'city' },
        { model: Review, as: 'reviews' },
        { model: Room, as: 'rooms' },
        { model: DynamicPricingRule, as: 'pricingRules' },
        { model: FlashDeal, as: 'flashDeals' }
      ],
    });

    if (!myHotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found.', status: 404 },
      });
    }

    // Helper: calculate average price per night for a hotel over the period
    const getHotelAvgPriceForPeriod = (hotelObj) => {
      if (!hotelObj.rooms || hotelObj.rooms.length === 0) {
        return Number(hotelObj.base_price_per_night || 0);
      }
      let totalRoomAvgSum = 0;
      hotelObj.rooms.forEach(room => {
        try {
          const baseRoomPrice = Number(room.price_per_night);
          const flashDeals = hotelObj.flashDeals || [];
          const country = hotelObj.city?.country || '';
          
          const pricingData = calculatePricing(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            baseRoomPrice,
            hotelObj.pricingRules || [],
            1,
            country,
            flashDeals
          );
          totalRoomAvgSum += (pricingData.totalPrice / periodDays);
        } catch(e) {
          totalRoomAvgSum += Number(room.price_per_night);
        }
      });
      return totalRoomAvgSum / hotelObj.rooms.length;
    };

    // My Avg Price
    const myAvgPrice = Number(getHotelAvgPriceForPeriod(myHotel).toFixed(2));

    // My Rating
    const myAvgRating =
      myHotel.reviews && myHotel.reviews.length > 0
        ? Number(
            (
              myHotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating), 0) /
              myHotel.reviews.length
            ).toFixed(1)
          )
        : Number(myHotel.star_rating);

    // My Occupancy
    const myBookings = await Booking.findAll({ where: { hotel_id: myHotel.id, status: 'confirmed' } });
    let myBookedNights = 0;
    myBookings.forEach(b => {
      const bIn = new Date(b.check_in_date).getTime();
      const bOut = new Date(b.check_out_date).getTime();
      const pIn = startDate.getTime();
      const pOut = endDate.getTime();
      
      const overlapStart = Math.max(bIn, pIn);
      const overlapEnd = Math.min(bOut, pOut);
      
      if (overlapEnd > overlapStart) {
        const overlapDays = (overlapEnd - overlapStart) / (1000 * 3600 * 24);
        myBookedNights += (overlapDays * b.num_rooms);
      }
    });

    const myTotalRooms = myHotel.rooms ? myHotel.rooms.reduce((sum, r) => sum + (r.available_rooms || 1), 0) : 1;
    const myOccupancy = myTotalRooms > 0 
      ? Math.min(100, (myBookedNights / (myTotalRooms * periodDays)) * 100) 
      : 0;

    // Competitors
    const competitorHotels = await Hotel.findAll({
      where: {
        city_id: myHotel.city_id,
        star_rating: myHotel.star_rating,
      },
      include: [
        { model: City, as: 'city' },
        { model: Review, as: 'reviews' },
        { model: Room, as: 'rooms' },
        { model: DynamicPricingRule, as: 'pricingRules' },
        { model: FlashDeal, as: 'flashDeals' }
      ],
    });

    const otherHotels = competitorHotels.filter((h) => h.id !== myHotel.id);
    const totalCompetitors = otherHotels.length;

    let marketAvgPrice = 0;
    let marketAvgRating = 0;
    let marketAvgOccupancy = 0;

    if (totalCompetitors > 0) {
      // Market Price
      let totalMarketPrice = 0;
      otherHotels.forEach(h => {
        totalMarketPrice += getHotelAvgPriceForPeriod(h);
      });
      marketAvgPrice = Number((totalMarketPrice / totalCompetitors).toFixed(2));

      // Market Rating
      let totalReviewsCount = 0;
      let totalRatingSum = 0;
      otherHotels.forEach((h) => {
        if (h.reviews && h.reviews.length > 0) {
          h.reviews.forEach((r) => {
            totalRatingSum += Number(r.overall_rating);
            totalReviewsCount += 1;
          });
        }
      });
      marketAvgRating =
        totalReviewsCount > 0
          ? Number((totalRatingSum / totalReviewsCount).toFixed(1))
          : Number(myHotel.star_rating);

      // Market Occupancy
      const otherHotelIds = otherHotels.map(h => h.id);
      const compBookings = await Booking.findAll({ where: { hotel_id: otherHotelIds, status: 'confirmed' } });
      
      let compBookedNights = 0;
      compBookings.forEach(b => {
        const bIn = new Date(b.check_in_date).getTime();
        const bOut = new Date(b.check_out_date).getTime();
        const pIn = startDate.getTime();
        const pOut = endDate.getTime();
        
        const overlapStart = Math.max(bIn, pIn);
        const overlapEnd = Math.min(bOut, pOut);
        
        if (overlapEnd > overlapStart) {
          const overlapDays = (overlapEnd - overlapStart) / (1000 * 3600 * 24);
          compBookedNights += (overlapDays * b.num_rooms);
        }
      });
      
      const compTotalRooms = otherHotels.reduce((sum, h) => {
        return sum + (h.rooms ? h.rooms.reduce((rSum, r) => rSum + (r.available_rooms || 1), 0) : 1);
      }, 0);
      
      marketAvgOccupancy = compTotalRooms > 0 
        ? Math.min(100, (compBookedNights / (compTotalRooms * periodDays)) * 100) 
        : 0;

    } else {
      marketAvgPrice = myAvgPrice;
      marketAvgRating = myAvgRating;
      marketAvgOccupancy = myOccupancy;
    }

    const priceDiffPercent = marketAvgPrice > 0
      ? Number((((myAvgPrice - marketAvgPrice) / marketAvgPrice) * 100).toFixed(1))
      : 0;

    const ratingDiff = Number((myAvgRating - marketAvgRating).toFixed(1));
    const occupancyDiff = Number((myOccupancy - marketAvgOccupancy).toFixed(1));

    let priceInsights = '';
    if (priceDiffPercent < -5) {
      priceInsights = \Your average room price is \% below the competitor average for this period. Consider raising prices to capture more revenue if occupancy allows.\;
    } else if (priceDiffPercent > 5) {
      priceInsights = \Your average room price is \% above the competitor average for this period. Ensure your amenities justify the premium.\;
    } else {
      priceInsights = \Your average room price is aligned with the competitor average for this period.\;
    }

    let occInsights = '';
    if (occupancyDiff < -5) {
      occInsights = \Your occupancy is \ percentage points below the competitor average for this period. Consider running a Flash Deal.\;
    } else if (occupancyDiff > 5) {
      occInsights = \Your occupancy is \ percentage points above the competitor average for this period! Great job capturing demand.\;
    } else {
      occInsights = \Your occupancy matches the competitor average for this period.\;
    }

    let ratInsights = '';
    if (ratingDiff < -0.2) {
      ratInsights = \Your hotel rating is below the competitor average. Focus on improving guest satisfaction.\;
    } else if (ratingDiff > 0.2) {
      ratInsights = \Your hotel rating is above the competitor average. Keep up the excellent service!\;
    } else {
      ratInsights = \Your hotel rating is on par with the competitor average.\;
    }

    res.status(200).json({
      success: true,
      data: {
        period: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        },
        myHotel: {
          id: myHotel.id,
          name: myHotel.name,
          city_name: myHotel.city ? myHotel.city.name : 'Unknown',
          star_rating: Number(myHotel.star_rating),
          avg_base_price: myAvgPrice,
          avg_guest_rating: myAvgRating,
          occupancy_rate: Number(myOccupancy.toFixed(1)),
        },
        marketAverage: {
          total_competitors: totalCompetitors,
          avg_base_price: Number(marketAvgPrice.toFixed(2)),
          avg_guest_rating: Number(marketAvgRating.toFixed(1)),
          avg_occupancy_rate: Number(marketAvgOccupancy.toFixed(1)),
        },
        differences: {
          price_difference_percentage: priceDiffPercent,
          price_difference_amount: Number((myAvgPrice - marketAvgPrice).toFixed(2)),
          rating_difference: ratingDiff,
          occupancy_difference: occupancyDiff,
        },
        insights: [priceInsights, occInsights, ratInsights],
      },
    });
  } catch (error) {
    next(error);
  }
};
'''

content = content.replace(old_func, new_func)

with open('backend/src/controllers/managerController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Backend benchmarking updated with proper backticks!")
