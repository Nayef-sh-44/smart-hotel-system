import re

with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchHotels to do a secondary call for eligible hotel IDs
fetch_hotels_start = '''      const hotelIds = fetchedHotels.map(h => h.id);
      fetchRecommendations(hotelIds);
    } catch (err) {'''

fetch_hotels_new = '''      // For recommendations, fetch eligible hotels using ONLY mandatory constraints
      const mandatoryParams = {
        city_id: selectedCity
      };
      if (guests) mandatoryParams.guests = guests;
      if (rooms) mandatoryParams.rooms = rooms;
      if (checkInDate) mandatoryParams.check_in = checkInDate;
      if (checkOutDate) mandatoryParams.check_out = checkOutDate;
      
      const eligibleRes = await hotelService.getAll(mandatoryParams);
      let eligibleHotels = [];
      if (Array.isArray(eligibleRes)) {
        eligibleHotels = eligibleRes;
      } else if (eligibleRes?.success) {
        eligibleHotels = eligibleRes.data;
      }
      
      const eligibleHotelIds = eligibleHotels.map(h => h.id);
      fetchRecommendations(eligibleHotelIds);
    } catch (err) {'''

content = content.replace(fetch_hotels_start, fetch_hotels_new)

# 2. Update fetchRecommendations to pass the mandatory params to the backend (needed for pricing logic in recommendations)
fetch_recs_start = '''        if (targetPrice) {
          params.target_price = targetPrice;
          params.user_currency = currency;
        }'''

fetch_recs_new = '''        if (targetPrice) {
          params.target_price = targetPrice;
          params.user_currency = currency;
        }
        if (guests) params.guests = guests;
        if (rooms) params.rooms = rooms;
        if (checkInDate) params.check_in_date = checkInDate;
        if (checkOutDate) params.check_out_date = checkOutDate;'''

content = content.replace(fetch_recs_start, fetch_recs_new)

with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Hotels.jsx patched successfully.")
