with open('backend/src/controllers/recommendationController.js', 'r', encoding='utf-8') as f:
    text = f.read()
    if 'filter' in text:
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if 'filter' in line:
                print('recommendationController.js:', i, line)
