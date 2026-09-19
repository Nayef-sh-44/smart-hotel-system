import { City } from './backend/src/models/index.js';

async function check() {
    const cities = await City.findAll();
    console.log(`Total cities: ${cities.length}`);
    for (const c of cities) {
        console.log(`[${c.id}] ${c.name}, ${c.country} -> Months: ${c.best_visit_months} | Desc: ${c.weather_description}`);
    }
}
check().catch(console.error).finally(() => process.exit(0));
