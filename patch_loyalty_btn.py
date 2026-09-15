with open('frontend/src/pages/Loyalty.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(">Redeem Now<", ">Use this reward for my next booking<")
content = content.replace("> Redeem Now", "> Use this reward for my next booking")
content = content.replace("Redeem Now", "Use this reward for my next booking")

with open('frontend/src/pages/Loyalty.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated label.")
