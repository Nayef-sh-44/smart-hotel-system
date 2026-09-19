import re

with open('frontend/src/components/BenchmarkingView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("s = ${year}-06-01;", "s = `${year}-06-01`;")
content = content.replace("e = ${year}-08-31;", "e = `${year}-08-31`;")
content = content.replace("s = ${year}-12-01;", "s = `${year}-12-01`;")
content = content.replace("e = ${year+1}-02-28;", "e = `${year+1}-02-28`;")

with open('frontend/src/components/BenchmarkingView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Syntax error fixed.")
