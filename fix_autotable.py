import re

with open('frontend/src/pages/TripPlan.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"styles:\s*\{\s*fontSize:\s*9,\s*font:\s*'Amiri'\s*\}", "styles: { fontSize: 9 }", content)
content = re.sub(r"headStyles:\s*\{\s*fillColor:\s*\[37,\s*99,\s*235\],\s*font:\s*'Amiri'\s*\}", "headStyles: { fillColor: [37, 99, 235] }", content)

with open('frontend/src/pages/TripPlan.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AutoTable styles fixed.")
