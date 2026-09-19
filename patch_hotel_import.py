import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import WeatherAndBestTime" not in content:
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport WeatherAndBestTime from '../components/WeatherAndBestTime.jsx';"
    )
    with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Import patched.")
else:
    print("Already imported.")
