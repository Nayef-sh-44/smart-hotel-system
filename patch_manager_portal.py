import re

with open('frontend/src/pages/ManagerPortal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update dealForm state
content = content.replace("start_date: '2026-08-01',", "start_datetime: '2026-08-01',")
content = content.replace("end_date: '2026-09-30',", "end_datetime: '2026-09-30',")

# 2. Update handleCreateDeal
content = content.replace("start_date: dealForm.start_date,", "start_datetime: dealForm.start_datetime,")
content = content.replace("end_date: dealForm.end_date", "end_datetime: dealForm.end_datetime")

# 3. Update Inputs
content = content.replace("value={dealForm.start_date}", "value={dealForm.start_datetime}")
content = content.replace("setDealForm({ ...dealForm, start_date: e.target.value })", "setDealForm({ ...dealForm, start_datetime: e.target.value })")

content = content.replace("value={dealForm.end_date}", "value={dealForm.end_datetime}")
content = content.replace("setDealForm({ ...dealForm, end_date: e.target.value })", "setDealForm({ ...dealForm, end_datetime: e.target.value })")

# 4. Update display
content = content.replace("Valid: {new Date(fd.start_date).toLocaleDateString()} to{' '}", "Valid: {new Date(fd.start_datetime).toLocaleDateString()} to{' '}")
content = content.replace("{new Date(fd.end_date).toLocaleDateString()}", "{new Date(fd.end_datetime).toLocaleDateString()}")

with open('frontend/src/pages/ManagerPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ManagerPortal.jsx patched.")
