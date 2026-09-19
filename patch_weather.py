import re

with open("frontend/src/components/WeatherAndBestTime.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the fallback
old_logic = """  // Best Time Parsing
  const rawMonths = hotel.city?.best_visit_months || 'Year-round';
  let recommendedIndices = [];
  
  if (rawMonths.toLowerCase().includes('year-round')) {"""

new_logic = """  // Best Time Parsing
  if (!hotel.city?.best_visit_months) {
    console.error('Best Time data missing from hotel.city', hotel);
  }

  const rawMonths = hotel.city?.best_visit_months || '';
  let recommendedIndices = [];
  
  if (rawMonths.toLowerCase() === 'year-round') {"""

content = content.replace(old_logic, new_logic)

old_desc = """  let weatherDesc = hotel.city?.weather_description;
  if (!weatherDesc) {
    weatherDesc = recommendedIndices.length === 12
      ? 'Suitable conditions throughout most of the year.' 
      : 'Mild temperatures and comfortable weather, making it suitable for sightseeing.';
  }"""

new_desc = """  let weatherDesc = hotel.city?.weather_description || 'Weather information unavailable.';"""

content = content.replace(old_desc, new_desc)

with open("frontend/src/components/WeatherAndBestTime.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched WeatherAndBestTime.jsx")
