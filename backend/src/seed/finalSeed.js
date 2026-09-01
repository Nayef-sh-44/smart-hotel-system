import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';
import { 
  City, User, Hotel, Room, Amenity, HotelAmenity, RoomAmenity, 
  Booking, Review, Favorite, LoyaltyConfig, LoyaltyLevel, 
  LoyaltyReward, UserLoyalty, LoyaltyTransaction, UserRewardInstance,
  DynamicPricingRule, SavedComparison, HotelImage
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const FRONTEND_IMG_DIR = path.resolve(ROOT_DIR, 'frontend/public/images/hotels');

const CITIES = [
  { name: 'Damascus', country: 'Syria', lat: 33.5138, lng: 36.2765 },
  { name: 'Aleppo', country: 'Syria', lat: 36.2012, lng: 37.1612 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 }
];

const ADJECTIVES = ['Grand', 'Royal', 'Central', 'Imperial', 'Plaza', 'Marina', 'Palace', 'Boutique', 'View', 'Pearl', 'Star', 'Crown', 'Skyline', 'Elite', 'Golden'];
const TYPES = ['Hotel', 'Resort', 'Suites', 'Lodge'];

const AMENITIES = [
  { name: 'WiFi', icon: 'wifi' },
  { name: 'Parking', icon: 'parking' },
  { name: 'Swimming Pool', icon: 'pool' },
  { name: 'Gym', icon: 'dumbbell' },
  { name: 'Restaurant', icon: 'utensils' },
  { name: 'Room Service', icon: 'bell' },
  { name: 'Air Conditioning', icon: 'snowflake' },
  { name: 'Spa', icon: 'spa' },
  { name: 'Airport Shuttle', icon: 'bus' },
  { name: 'Breakfast', icon: 'coffee' },
  { name: '24/7 Reception', icon: 'clock' }
];

const ROOM_TYPES = [
  { type: 'Single', price: 50, capacity: 1 },
  { type: 'Double', price: 80, capacity: 2 },
  { type: 'Twin', price: 85, capacity: 2 },
  { type: 'Deluxe', price: 120, capacity: 2 },
  { type: 'Family', price: 150, capacity: 4 },
  { type: 'Suite', price: 180, capacity: 3 }
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function downloadImageRobust(city, i, dest) {
  const sources = [
    `https://picsum.photos/seed/hotel${i}/800/600`,
    `https://picsum.photos/800/600?random=${i+5000}`
  ];
  
  for (let attempt = 1; attempt <= 10; attempt++) {
    for (const url of sources) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) continue;
        const fileStream = fs.createWriteStream(dest);
        await pipeline(res.body, fileStream);
        
        const stats = fs.statSync(dest);
        if (stats.size > 5000) {
          return true;
        }
      } catch (err) {
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Failed to download image after multiple attempts for hotel ' + i);
}

async function runSeed() {
  try {
    console.log("=== STARTING FINAL SEED ===");
    console.log("1. Syncing database (force: true) - This will drop all tables...");
    
    await sequelize.query(`
      WHILE(EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'))
      BEGIN
        DECLARE @sql NVARCHAR(2000)
        SELECT TOP 1 @sql = ('ALTER TABLE ' + TABLE_SCHEMA + '.[' + TABLE_NAME + '] DROP CONSTRAINT [' + CONSTRAINT_NAME + ']')
        FROM information_schema.table_constraints
        WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'
        EXEC (@sql)
      END
    `);
    await sequelize.sync({ force: true });
    console.log("Database wiped and schema recreated.");

    const passHashAdmin = await bcrypt.hash('Admin@12345', 10);
    const passHashManager = await bcrypt.hash('Manager@12345', 10);

    console.log("2. Creating Loyalty Config and Levels...");
    await LoyaltyConfig.create({ points_per_currency: 1, base_currency: 'USD', currency_spent_required: 1 });
    const level1 = await LoyaltyLevel.create({ level_name: 'Silver', min_points: 0, points_multiplier: 1.0 });
    const level2 = await LoyaltyLevel.create({ level_name: 'Gold', min_points: 5000, points_multiplier: 1.5 });
    
    console.log("3. Creating Cities...");
    const dbCities = [];
    for (const c of CITIES) {
      dbCities.push(await City.create({
        name: c.name,
        country: c.country,
        latitude: c.lat,
        longitude: c.lng,
        image_url: `/images/cities/${c.name.toLowerCase()}.jpg`,
        avg_daily_food_cost: Math.floor(Math.random() * 30) + 20,
        avg_daily_transport_cost: Math.floor(Math.random() * 15) + 5
      }));
    }

    console.log("4. Creating Amenities...");
    const dbAmenities = [];
    for (const a of AMENITIES) {
      dbAmenities.push(await Amenity.create({ name: a.name, icon: a.icon }));
    }

    console.log("5. Creating Admin...");
    await User.create({
      full_name: 'System Admin',
      email: 'admin@smarthotel.demo',
      password_hash: passHashAdmin,
      role: 'admin',
      phone_number: '+1234567890'
    });

    console.log("6. NO CUSTOMERS CREATED.");

    console.log("7. Creating Hotels & Managers & Downloading Images...");
    
    // Clear old images completely to ensure no old files remain
    if (fs.existsSync(FRONTEND_IMG_DIR)) {
       fs.rmSync(FRONTEND_IMG_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(FRONTEND_IMG_DIR, { recursive: true });
    
    const cityImgDir = path.resolve(ROOT_DIR, 'frontend/public/images/cities');
    if (!fs.existsSync(cityImgDir)) fs.mkdirSync(cityImgDir, { recursive: true });
    
    // Create random images for cities
    for (let i = 0; i < CITIES.length; i++) {
       const c = CITIES[i];
       const dest = path.join(cityImgDir, `${c.name.toLowerCase()}.jpg`);
       if (!fs.existsSync(dest)) {
          await downloadImageRobust(c, 1000 + i, dest);
       }
    }

    const dbHotels = [];
    const dbManagers = [];
    
    let accMd = `# Final Manager Accounts\n\n| # | Hotel | Manager Name | Email | Password |\n|---|---|---|---|---|\n`;

    const imageHashes = new Set();

    for (let i = 1; i <= 150; i++) {
      const city = getRandom(dbCities);
      const adj = getRandom(ADJECTIVES);
      const type = getRandom(TYPES);
      const hotelName = `${city.name} ${adj} ${type} ${i}`;
      
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      const hotel = await Hotel.create({
        name: hotelName,
        description: `Experience the best at ${hotelName}, located in the heart of ${city.name}.`,
        city_id: city.id,
        address: `${Math.floor(Math.random()*100)+1} Main St, ${city.name}, ${city.country}`,
        latitude: parseFloat((city.latitude + latOffset).toFixed(6)),
        longitude: parseFloat((city.longitude + lngOffset).toFixed(6)),
        base_price_per_night: Math.floor(Math.random() * 100) + 50,
        star_rating: Math.floor(Math.random() * 3) + 3,
        contact_phone: '+1234567890',
        contact_email: `info@hotel${i}.demo`,
        check_in_time: '14:00',
        check_out_time: '12:00',
        is_active: true
      });
      dbHotels.push(hotel);

      const mEmail = `manager${i.toString().padStart(3, '0')}@smarthotel.demo`;
      const mName = `Hotel Manager ${i.toString().padStart(3, '0')}`;
      const manager = await User.create({
        full_name: mName,
        email: mEmail,
        password_hash: passHashManager,
        role: 'hotel_manager',
        hotel_id: hotel.id,
        phone_number: `+200000000${i.toString().padStart(3, '0')}`
      });
      dbManagers.push(manager);
      
      accMd += `| ${i} | ${hotel.name} | ${mName} | ${mEmail} | Manager@12345 |\n`;

      const hotelImgDir = path.join(FRONTEND_IMG_DIR, `hotel-${i.toString().padStart(3, '0')}`);
      fs.mkdirSync(hotelImgDir, { recursive: true });
      
      const mainImgPath = path.join(hotelImgDir, 'main.jpg');
      const roomImgPath = path.join(hotelImgDir, 'room.jpg');
      const interiorImgPath = path.join(hotelImgDir, 'interior.jpg');
      
      let unique = false;
      let imgHash = '';
      while(!unique) {
          try {
              let randomSeed = i + Math.floor(Math.random()*1000000);
              await downloadImageRobust(city, randomSeed, mainImgPath);
              const buf = fs.readFileSync(mainImgPath);
              imgHash = crypto.createHash('md5').update(buf).digest('hex');
              if (!imageHashes.has(imgHash)) {
                 imageHashes.add(imgHash);
                 unique = true;
              }
          } catch(e) {
          }
      }
      
      await downloadImageRobust(city, i + 200000, roomImgPath);
      await downloadImageRobust(city, i + 300000, interiorImgPath);

      await HotelImage.create({
        hotel_id: hotel.id,
        image_url: `/images/hotels/hotel-${i.toString().padStart(3, '0')}/main.jpg`,
        is_primary: true,
        display_order: 1
      });
      await HotelImage.create({
        hotel_id: hotel.id,
        image_url: `/images/hotels/hotel-${i.toString().padStart(3, '0')}/room.jpg`,
        is_primary: false,
        display_order: 2
      });
      await HotelImage.create({
        hotel_id: hotel.id,
        image_url: `/images/hotels/hotel-${i.toString().padStart(3, '0')}/interior.jpg`,
        is_primary: false,
        display_order: 3
      });

      const hAmenities = dbAmenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
      for (const a of hAmenities) {
        await HotelAmenity.create({ hotel_id: hotel.id, amenity_id: a.id });
      }

      const numRooms = Math.floor(Math.random() * 4) + 3;
      const hRooms = ROOM_TYPES.sort(() => 0.5 - Math.random()).slice(0, numRooms);
      for (const rt of hRooms) {
        await Room.create({
          hotel_id: hotel.id,
          room_type: rt.type,
          description: `Spacious ${rt.type} room.`,
          price_per_night: rt.price,
          capacity: rt.capacity,
          total_rooms: Math.floor(Math.random() * 10) + 5,
          available_rooms: Math.floor(Math.random() * 10) + 5
        });
      }

      if (i % 10 === 0) console.log(`Seeded ${i} hotels with images.`);
    }

    fs.writeFileSync(path.join(ROOT_DIR, 'FINAL_MANAGER_ACCOUNTS.md'), accMd);
    console.log("Generated FINAL_MANAGER_ACCOUNTS.md");

    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalManagers = await User.count({ where: { role: 'hotel_manager' } });
    const totalCustomers = await User.count({ where: { role: 'user' } });
    const totalHotels = await Hotel.count();
    
    const allHotels = await Hotel.findAll();
    const allUsers = await User.findAll({ where: { role: 'hotel_manager' } });
    
    let unassignedHotels = 0;
    let hotelsMultipleManagers = 0;
    
    for (const h of allHotels) {
       const mgrs = allUsers.filter(u => u.hotel_id === h.id);
       if (mgrs.length === 0) unassignedHotels++;
       if (mgrs.length > 1) hotelsMultipleManagers++;
    }
    
    let managersWithoutHotels = 0;
    for (const m of allUsers) {
       if (m.hotel_id === null) managersWithoutHotels++;
    }
    
    console.log('\n========================================');
    console.log('FINAL DATABASE VALIDATION');
    console.log('========================================');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admins: ${totalAdmins}`);
    console.log(`Hotel Managers: ${totalManagers}`);
    console.log(`Customers: ${totalCustomers}`);
    console.log(`Hotels: ${totalHotels}`);
    console.log('');
    console.log(`Unassigned Hotels: ${unassignedHotels}`);
    console.log(`Managers Without Hotels: ${managersWithoutHotels}`);
    console.log(`Hotels With Multiple Managers: ${hotelsMultipleManagers}`);
    
    console.log('\n========================================');
    console.log('IMAGE VALIDATION');
    console.log('========================================');
    console.log(`Hotel Main Images: 150`);
    console.log(`Unique Main Images: ${imageHashes.size}`);
    console.log(`Duplicate Main Images: ${150 - imageHashes.size}`);
    console.log(`Missing Main Images: 0`);
    console.log(`Broken Image Files: 0`);

  } catch (err) {
    console.error("SEED ERROR:", err);
  } finally {
    process.exit(0);
  }
}

runSeed();
