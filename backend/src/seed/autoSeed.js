import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.count();
    const hotelCount = await Hotel.count();
    if (hotelCount > 0 && userCount >= 15) {
      console.log(`[AutoSeed] Database already has ${hotelCount} hotels and ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('[AutoSeed] Seeding initial data from seedData.json...');
    const seedFilePath = path.join(__dirname, 'seedData.json');
    if (!fs.existsSync(seedFilePath)) {
      console.warn('[AutoSeed] seedData.json not found, skipping seeding.');
      return;
    }

    const raw = fs.readFileSync(seedFilePath, 'utf-8');
    const data = JSON.parse(raw);

    // Correct topological order: cities -> hotels -> users -> rooms -> amenities -> ...
    const tablesWithIdentity = [
      'cities',
      'hotels',
      'users',
      'rooms',
      'amenities',
      'tourist_attractions',
      'nearby_services',
      'loyalty_levels',
      'loyalty_rewards',
      'loyalty_config',
      'dynamic_pricing_rules',
      'flash_deals'
    ];

    for (const table of tablesWithIdentity) {
      const rows = data[table] || [];
      if (rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row).map(c => `[${c}]`).join(', ');
        const values = Object.values(row).map(val => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (typeof val === 'number') return val;
          const escaped = String(val).replace(/'/g, "''");
          return `'${escaped}'`;
        }).join(', ');

        const sql = `SET IDENTITY_INSERT [${table}] ON; INSERT INTO [${table}] (${columns}) VALUES (${values}); SET IDENTITY_INSERT [${table}] OFF;`;
        try {
          await sequelize.query(sql);
        } catch (err) {
          // Ignore duplicate primary key errors if already seeded
        }
      }

      console.log(`[AutoSeed] Seeded ${rows.length} rows into ${table}`);
    }

    // Seed tables without identity (like hotel_amenities)
    const junctionTables = ['hotel_amenities', 'room_amenities'];
    for (const table of junctionTables) {
      const rows = data[table] || [];
      if (rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row).map(c => `[${c}]`).join(', ');
        const values = Object.values(row).map(val => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (typeof val === 'number') return val;
          const escaped = String(val).replace(/'/g, "''");
          return `'${escaped}'`;
        }).join(', ');

        try {
          await sequelize.query(`INSERT INTO [${table}] (${columns}) VALUES (${values});`);
        } catch (err) {
          // Ignore duplicate keys
        }
      }
      console.log(`[AutoSeed] Seeded ${rows.length} rows into ${table}`);
    }

    console.log('[AutoSeed] Seeding completed successfully!');
  } catch (error) {
    console.error('[AutoSeed] Error during auto-seeding:', error);
  }
};
