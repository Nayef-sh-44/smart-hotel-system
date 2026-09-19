import re

with open('frontend/src/services/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("getCompetitorBenchmarking: () => api.get('/manager/competitor-benchmarking'),", "getCompetitorBenchmarking: (params) => api.get('/manager/competitor-benchmarking', { params }),")

with open('frontend/src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
