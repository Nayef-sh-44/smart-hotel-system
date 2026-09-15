import re

with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"        if \(targetPrice\) \{\n          params.target_price = targetPrice;\n          params.user_currency = currency;\n        \}"
replacement = r"        if (targetPrice) {\n          params.target_price = targetPrice;\n          params.user_currency = currency;\n        }\n        if (guests) params.guests = guests;\n        if (rooms) params.rooms = rooms;\n        if (checkInDate) params.check_in_date = checkInDate;\n        if (checkOutDate) params.check_out_date = checkOutDate;"

if re.search(pattern, content):
    new_content = re.sub(pattern, replacement, content)
    with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched params successfully.")
else:
    print("Not found via regex.")
