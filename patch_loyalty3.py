with open('frontend/src/pages/Loyalty.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("navigate(/hotel/?reward_id=);", "navigate(/hotel/?reward_id=);")

with open('frontend/src/pages/Loyalty.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
