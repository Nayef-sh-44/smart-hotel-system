import re

with open("backend/src/controllers/managerController.js", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r"import \{ calculatePricing \} from '\.\./services/pricingService\.js';\n?", "", content)

content = "import { calculatePricing } from '../services/pricingService.js';\n" + content

with open("backend/src/controllers/managerController.js", "w", encoding="utf-8") as f:
    f.write(content)
