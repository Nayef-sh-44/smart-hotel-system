with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_block = '''        // For recommendations, fetch eligible hotels using ONLY mandatory constraints
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
        fetchRecommendations(eligibleHotelIds);'''

good_block = '''        const hotelIds = fetchedHotels.map(h => h.id);
        fetchRecommendations(hotelIds);'''

if bad_block in content:
    content = content.replace(bad_block, good_block)
    with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Reverted successfully.")
else:
    print("Could not find bad block!")
