with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        if (targetPrice) {
          params.target_price = targetPrice;
          params.user_currency = currency;
        }'''

replacement = '''        if (targetPrice) {
          params.target_price = targetPrice;
          params.user_currency = currency;
        }
        if (guests) params.guests = guests;
        if (rooms) params.rooms = rooms;
        if (checkInDate) params.check_in_date = checkInDate;
        if (checkOutDate) params.check_out_date = checkOutDate;'''

if target in content:
    # ensure we only replace the second occurrence (which is inside fetchRecommendations)
    parts = content.split(target)
    if len(parts) == 3:
        new_content = parts[0] + target + parts[1] + replacement + parts[2]
        with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Patched params successfully.")
    else:
        print("Unexpected number of occurrences.")
else:
    print("Target not found.")
