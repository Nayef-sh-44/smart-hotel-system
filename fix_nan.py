import re

with open("backend/src/controllers/managerController.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'myBookedNights += (overlapDays * b.num_rooms);',
    'myBookedNights += (overlapDays * (b.num_rooms || 1));'
)
content = content.replace(
    'compBookedNights += (overlapDays * b.num_rooms);',
    'compBookedNights += (overlapDays * (b.num_rooms || 1));'
)

with open("backend/src/controllers/managerController.js", "w", encoding="utf-8") as f:
    f.write(content)
print("NaN issue fixed.")
