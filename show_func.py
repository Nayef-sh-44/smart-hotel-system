with open('backend/src/controllers/managerController.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('export const getCompetitorBenchmarking')
end = content.find('export const', start + 1)
print(content[start:end if end != -1 else len(content)])
