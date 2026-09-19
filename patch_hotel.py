import re

with open("frontend/src/pages/HotelDetail.jsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import WeatherAndBestTime" not in content:
    content = content.replace(
        "import { useParams, useNavigate, useSearchParams } from 'react-router-dom';",
        "import { useParams, useNavigate, useSearchParams } from 'react-router-dom';\nimport WeatherAndBestTime from '../components/WeatherAndBestTime';"
    )

old_map_section = """      {/* Map Section */}
      {hotel.latitude && hotel.longitude && ("""

new_map_section = """      <WeatherAndBestTime hotel={hotel} />

      {/* Map Section */}
      {hotel.latitude && hotel.longitude && ("""

if "<WeatherAndBestTime hotel={hotel} />" not in content:
    content = content.replace(old_map_section, new_map_section)
    with open("frontend/src/pages/HotelDetail.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("HotelDetail patched.")
else:
    print("Already patched.")

