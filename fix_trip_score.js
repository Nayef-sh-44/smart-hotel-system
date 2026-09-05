const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/recommendationController.js', 'utf8');

// Find the Trip Type scoring block and remove it
const tripScoreRegex = /\/\/ 5\. Trip Type[^]*?score \+= tripScore;\n/g;
code = code.replace(tripScoreRegex, '');

fs.writeFileSync('backend/src/controllers/recommendationController.js', code);
