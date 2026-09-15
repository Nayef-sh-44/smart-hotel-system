import re

with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "// For recommendations, fetch eligible hotels using ONLY mandatory constraints"
end_marker = "fetchRecommendations(eligibleHotelIds);"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    good_block = '''const hotelIds = fetchedHotels.map(h => h.id);
        fetchRecommendations(hotelIds);'''
    new_content = content[:start_idx] + good_block + content[end_idx:]
    with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Reverted successfully.")
else:
    print("Failed to find markers")
