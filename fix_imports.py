with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    code = f.read()

import re
# We need to remove the duplicate imports we just added.
# Or better, just restore the file again and run the python script with the correct imports.
