import { Sequelize } from 'sequelize';

const masterSeq = new Sequelize('HotelBookingDB', 'sa', 'SmartHotel2026!', {
    host: 'localhost',
    port: 1434,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
        },
    },
    logging: false,
});

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
    "Istanbul": { best_visit_months: "Apr, May, Sep, Oct", weather_description: "Pleasant breezes and comfortable temperatures for exploring historical sites." }
};

async function fix() {
    await masterSeq.authenticate();
    console.log("Connected to Docker SQL Server instance successfully.");

    const [cities] = await masterSeq.query(`SELECT id, name FROM Cities`);
    
    for (const c of cities) {
        const data = cityData[c.name];
        if (data) {
            await masterSeq.query(`UPDATE Cities SET best_visit_months = '${data.best_visit_months}', weather_description = '${data.weather_description.replace(/'/g, "''")}' WHERE id = ${c.id}`);
            console.log(`Updated ${c.name}`);
        } else {
            const defM = "Apr, May, Sep, Oct";
            const defD = "Mild temperatures making these months comfortable for sightseeing and outdoor activities.";
            await masterSeq.query(`UPDATE Cities SET best_visit_months = '${defM}', weather_description = '${defD.replace(/'/g, "''")}' WHERE id = ${c.id}`);
            console.log(`Updated ${c.name} with default`);
        }
    }
}
fix().catch(console.error).finally(() => process.exit(0));
