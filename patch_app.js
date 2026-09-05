const fs = require('fs');
const file = 'frontend/src/App.jsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(/import \{ ComparisonProvider \} from '.\/context\/ComparisonContext.jsx';/, `import { ComparisonProvider } from './context/ComparisonContext.jsx';\nimport { TripProvider } from './context/TripContext.jsx';`);
code = code.replace(/<ComparisonProvider>/, `<ComparisonProvider>\n          <TripProvider>`);
code = code.replace(/<\/ComparisonProvider>/, `</TripProvider>\n        </ComparisonProvider>`);

fs.writeFileSync(file, code);
console.log("PATCHED APP");
