import { City } from './backend/src/models/index.js';

async function check() {
    const cities = await City.findAll();
    console.log(`Total cities: ${cities.length}`);
    for (const c of cities) {
        if(c.name === 'Damascus' || c.id > 15) {
            console.log(`[${c.id}] ${c.name}, ${c.country}`);
        }
    }
}
check().catch(console.error).finally(() => process.exit(0));
