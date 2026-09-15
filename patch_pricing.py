import re

with open('backend/src/controllers/recommendationController.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "import { calculatePricing } from '../services/pricingService.js';\n"
if "calculatePricing" not in content:
    content = import_stmt + content

map_start = "const scoredHotels = allHotels.map((hotel) => {"
new_map_start = '''const scoredHotels = allHotels.map((hotel) => {
      const hotelObj = hotel.toJSON ? hotel.toJSON() : hotel;
      if (hotelObj.rooms && hotelObj.rooms.length > 0) {
        const minRoomPrice = Math.min(...hotelObj.rooms.map(r => Number(r.price_per_night)));
        try {
          const reqNumRooms = Number(req.query.rooms || 1);
          const checkInDate = req.query.check_in_date ? new Date(req.query.check_in_date) : new Date();
          const checkOutDate = req.query.check_out_date ? new Date(req.query.check_out_date) : new Date(checkInDate.getTime() + 86400000);
          
          const pricingData = calculatePricing(
            checkInDate,
            checkOutDate,
            minRoomPrice,
            hotelObj.pricingRules || [],
            reqNumRooms,
            hotelObj.city?.country || '',
            hotelObj.flashDeals || []
          );
          hotelObj.starting_price = pricingData.totalPrice / Math.max(1, (checkOutDate - checkInDate) / 86400000) / reqNumRooms;
        } catch (e) {
          hotelObj.starting_price = minRoomPrice;
        }
      } else {
        hotelObj.starting_price = null;
      }
'''
content = content.replace(map_start, new_map_start)

# Replace hotel, in the return statement
content = content.replace("return {\n        hotel,", "return {\n        hotel: hotelObj,")

with open('backend/src/controllers/recommendationController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("recommendationController.js patched for pricing.")
