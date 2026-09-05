const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/recommendationController.js', 'utf8');
code = code.replace(',\n, Favorite }', ',\n  Favorite\n}');
code = code.replace(', Favorite }', ',\n  Favorite\n}');
fs.writeFileSync('backend/src/controllers/recommendationController.js', code);
