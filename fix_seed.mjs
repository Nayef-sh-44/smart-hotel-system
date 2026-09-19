import fs from 'fs';

const cityData = {
    "Miami": { best_visit_months: "Dec, Jan, Feb, Mar, Apr", weather_description: "Warm, sunny winters perfect for beach activities before the humid summer." },
    "London": { best_visit_months: "May, Jun, Jul, Aug, Sep", weather_description: "Pleasant summer days ideal for sightseeing and enjoying historic parks." },
    "Sydney": { best_visit_months: "Sep, Oct, Nov, Mar, Apr", weather_description: "Comfortable spring and autumn weather, avoiding the peak summer heat." },
    "Barcelona": { best_visit_months: "May, Jun, Sep, Oct", weather_description: "Warm Mediterranean climate with sunny skies, avoiding the intense July/August heat." },
    "Los Angeles": { best_visit_months: "Mar, Apr, May, Sep, Oct, Nov", weather_description: "Mild and clear weather, perfect for outdoor activities especially in spring and fall." },
    "Amsterdam": { best_visit_months: "Apr, May, Jun, Sep", weather_description: "Tulip blooms in spring and pleasant early autumn days perfect for canal walks." },
    "Paris": { best_visit_months: "Apr, May, Jun, Sep, Oct", weather_description: "Mild spring and autumn temperatures, ideal for walking and enjoying cafe culture." },
    "Tokyo": { best_visit_months: "Mar, Apr, Oct, Nov", weather_description: "Cherry blossoms in spring and vibrant autumn foliage with crisp, clear skies." },
    "New York City": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Pleasant spring and crisp autumn weather, avoiding extreme summer heat and winter cold." },
    "Chicago": { best_visit_months: "May, Jun, Sep, Oct", weather_description: "Comfortable temperatures for exploring the city's architecture and lakefront." },
    "Madrid": { best_visit_months: "May, Jun, Sep, Oct", weather_description: "Warm and sunny, avoiding the intense mid-summer heat of central Spain." },
    "Singapore": { best_visit_months: "Feb, Mar, Apr", weather_description: "Slightly less rainfall and more sunshine, though generally tropical year-round." },
    "Berlin": { best_visit_months: "May, Jun, Sep, Oct", weather_description: "Pleasant temperatures for sightseeing and enjoying outdoor beer gardens." },
    "Rome": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Mediterranean warmth ideal for exploring ancient ruins without the peak summer heat." },
    "Vienna": { best_visit_months: "Apr, May, Sep, Oct, Dec", weather_description: "Mild spring/autumn weather and magical Christmas markets in December." },
    "Dubai": { best_visit_months: "Nov, Dec, Jan, Feb, Mar", weather_description: "Perfect winter sunshine and comfortable temperatures for outdoor exploration." },
    "Toronto": { best_visit_months: "Jun, Jul, Aug, Sep", weather_description: "Warm and pleasant summer months ideal for festivals and outdoor dining." },
    "Las Vegas": { best_visit_months: "Mar, Apr, May, Oct, Nov", weather_description: "Comfortable desert temperatures perfect for enjoying the Strip and nearby canyons." },
    "Bangkok": { best_visit_months: "Nov, Dec, Jan, Feb", weather_description: "Cooler, dry season ideal for exploring temples and bustling street markets." },
    "Istanbul": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Pleasant breezes and comfortable temperatures for exploring historical sites." },
    // others in seedData.json that might not be in DB
    "Athens": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Comfortable weather for visiting the Acropolis without extreme summer heat." },
    "Cairo": { best_visit_months: "Oct, Nov, Dec, Jan, Feb, Mar", weather_description: "Cooler weather ideal for visiting the Pyramids and ancient sites." },
    "Seoul": { best_visit_months: "Mar, Apr, May, Sep, Oct, Nov", weather_description: "Pleasant spring blossoms and beautiful autumn foliage." },
    "Riyadh": { best_visit_months: "Nov, Dec, Jan, Feb, Mar", weather_description: "Mild and pleasant winter months suitable for outdoor activities." },
    "Jeddah": { best_visit_months: "Oct, Nov, Dec, Jan, Feb, Mar", weather_description: "Comfortable coastal winter temperatures before the intense summer humidity." },
    "Mecca": { best_visit_months: "Nov, Dec, Jan, Feb, Mar", weather_description: "Cooler winter temperatures make outdoor rituals more comfortable." },
    "Medina": { best_visit_months: "Nov, Dec, Jan, Feb, Mar", weather_description: "Pleasant winter climate for visiting historical and religious sites." },
    "New York": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Pleasant spring and crisp autumn weather, avoiding extreme summer heat." },
    "San Francisco": { best_visit_months: "Sep, Oct, Nov", weather_description: "Warmest and clearest months of the year, avoiding the summer fog." },
    "Vancouver": { best_visit_months: "Jun, Jul, Aug, Sep", weather_description: "Warm, dry summer months ideal for enjoying the outdoors." },
    "Montreal": { best_visit_months: "May, Jun, Sep, Oct", weather_description: "Pleasant temperatures for exploring festivals and autumn colors." },
    "Zurich": { best_visit_months: "Jun, Jul, Aug, Sep", weather_description: "Pleasant summer weather ideal for lake swimming and alpine views." }
};

const file = './backend/src/seed/seedData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const city of data.cities) {
    const cd = cityData[city.name];
    if (cd) {
        city.best_visit_months = cd.best_visit_months;
        city.weather_description = cd.weather_description;
    } else {
        city.best_visit_months = "Apr, May, Sep, Oct";
        city.weather_description = "Mild temperatures making these months comfortable for sightseeing and outdoor activities.";
    }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log("Updated seedData.json");
