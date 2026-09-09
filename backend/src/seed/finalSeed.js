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
const CITY_IMG_DIR = path.resolve(ROOT_DIR, 'frontend/public/images/cities');

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
  { name: '24/7 Reception', icon: 'clock' },
  { name: 'Business Center', icon: 'briefcase' },
  { name: 'Family Rooms', icon: 'users' },
  { name: 'Meeting Rooms', icon: 'users' },
  { name: 'Laundry', icon: 'tshirt' }
];

const ROOM_TYPES = [
  { type: 'Standard Room', price: 60, capacity: 2 },
  { type: 'Single Room', price: 50, capacity: 1 },
  { type: 'Double Room', price: 80, capacity: 2 },
  { type: 'Twin Room', price: 85, capacity: 2 },
  { type: 'Deluxe Room', price: 120, capacity: 2 },
  { type: 'Family Room', price: 150, capacity: 4 },
  { type: 'Executive Room', price: 160, capacity: 2 },
  { type: 'Suite', price: 200, capacity: 3 },
  { type: 'Presidential Suite', price: 400, capacity: 4 }
];

const PREFERRED_CITIES = [
  "Dubai", "Singapore", "London", "Paris", "Rome", 
  "New York City", "Istanbul", "Bangkok", "Barcelona", 
  "Madrid", "Tokyo", "Vienna", "Cairo", "Sydney", "Las Vegas"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFilenameFromUrl(url) {
  const parts = url.split('Special:FilePath/');
  if (parts.length > 1) {
    return decodeURIComponent(parts[1]).replace(/ /g, '_');
  }
  return 'hotel.jpg';
}

async function downloadWikimediaImage(wikiUrl, destPath) {
  const filename = getFilenameFromUrl(wikiUrl);
  const thumbUrl = `https://commons.wikimedia.org/w/thumb.php?width=800&f=${encodeURIComponent(filename)}`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(thumbUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const fileStream = fs.createWriteStream(destPath);
      await pipeline(res.body, fileStream);
      
      const stats = fs.statSync(destPath);
      if (stats.size > 2000) {
        return true;
      }
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function runSeed() {
  try {
    console.log("=== STARTING FINAL REAL DATA SEED ===");
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
    const passHashCustomer = await bcrypt.hash('User@12345', 10);

    console.log("2. Creating Loyalty Config and Levels...");
    await LoyaltyConfig.create({ points_per_currency: 1, base_currency: 'USD', currency_spent_required: 1 });
    const level1 = await LoyaltyLevel.create({ level_name: 'Silver', min_points: 0, points_multiplier: 1.0 });
    const level2 = await LoyaltyLevel.create({ level_name: 'Gold', min_points: 5000, points_multiplier: 1.5 });
    
    console.log("3. Creating Admin and Demo Customers...");
    await User.create({
      full_name: 'System Admin',
      email: 'admin@smarthotel.demo',
      password_hash: passHashAdmin,
      role: 'admin',
      phone_number: '+1234567890'
    });
    
    const customers = [];
    for(let i=1; i<=75; i++) {
      customers.push(await User.create({
        full_name: `Demo Customer ${i}`,
        email: `user${i.toString().padStart(3, '0')}@smarthotel.demo`,
        password_hash: passHashCustomer,
        role: 'user'
      }));
    }

    console.log("4. Creating Amenities...");
    const dbAmenities = [];
    for (const a of AMENITIES) {
      dbAmenities.push(await Amenity.create({ name: a.name, icon: a.icon }));
    }

    console.log("5. Processing Real Hotels from Wikidata...");
    const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'hotels_wikidata_bbox.json'), 'utf8'));
    
    // Clear old images completely
    if (fs.existsSync(FRONTEND_IMG_DIR)) {
       fs.rmSync(FRONTEND_IMG_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(FRONTEND_IMG_DIR, { recursive: true });
    
    if (!fs.existsSync(CITY_IMG_DIR)) fs.mkdirSync(CITY_IMG_DIR, { recursive: true });

    let accMd = `# Final Manager Accounts\n\n| # | Hotel | Manager Name | Email | Password |\n|---|---|---|---|---|\n`;

    const cityMap = new Map();
    const imageHashes = new Set();
    const hotelNames = new Set();
    let importedHotels = 0;
    
    // Shuffle rawData to ensure good distribution if we trim
    rawData.sort(() => 0.5 - Math.random());

    for (const h of rawData) {
      if (importedHotels >= 550) break; // Limit to ~550

      // Deduplicate by name
      if (hotelNames.has(h.name)) continue;
      
      // Setup City if not exists
      let dbCity = cityMap.get(h.city);
      if (!dbCity) {
        dbCity = await City.create({
          name: h.city,
          country: h.country,
          latitude: parseFloat(h.lat),
          longitude: parseFloat(h.lon),
          image_url: `/images/cities/${h.city.toLowerCase().replace(/ /g, '_')}.jpg`,
          avg_daily_food_cost: Math.floor(Math.random() * 30) + 20,
          avg_daily_transport_cost: Math.floor(Math.random() * 15) + 5
        });
        cityMap.set(h.city, dbCity);
        
        // Let's just download the first hotel's image as the city image for now if it doesn't exist
        const cImgDest = path.join(CITY_IMG_DIR, `${h.city.toLowerCase().replace(/ /g, '_')}.jpg`);
        if (!fs.existsSync(cImgDest)) {
          try { await downloadWikimediaImage(h.image, cImgDest); } catch(e) {}
        }
      }

      // Download Image
      const hotelImgDir = path.join(FRONTEND_IMG_DIR, `hotel-${importedHotels + 1}`);
      fs.mkdirSync(hotelImgDir, { recursive: true });
      const mainImgPath = path.join(hotelImgDir, 'main.jpg');
      
      let imgHash = '';
      try {
        await downloadWikimediaImage(h.image, mainImgPath);
        const buf = fs.readFileSync(mainImgPath);
        imgHash = crypto.createHash('md5').update(buf).digest('hex');
        
        // Deduplicate by image hash (avoid generic placeholders or same image assigned to multiple hotels)
        if (imageHashes.has(imgHash)) {
          // If duplicate image, delete directory and skip this hotel
          fs.rmSync(hotelImgDir, { recursive: true, force: true });
          continue;
        }
        imageHashes.add(imgHash);
      } catch(e) {
        fs.rmSync(hotelImgDir, { recursive: true, force: true });
        continue; // skip if image download fails
      }

      hotelNames.add(h.name);
      importedHotels++;

      // Create Hotel
      let stars = parseInt(h.stars) || 0;
      if (stars < 2 || stars > 5) stars = Math.floor(Math.random() * 4) + 2; // Random 2-5 if invalid
      
      const hotel = await Hotel.create({
        name: h.name,
        description: `Experience the best at ${h.name}, a ${stars}-star property located in the heart of ${h.city}.`,
        city_id: dbCity.id,
        address: `Central ${h.city}, ${h.country}`,
        latitude: parseFloat(h.lat),
        longitude: parseFloat(h.lon),
        base_price_per_night: Math.floor(Math.random() * 100) + (stars * 30), // 2-star: 60+, 5-star: 150+
        currency: 'USD',
        star_rating: stars,
        contact_phone: '+1234567890',
        contact_email: `info@hotel${importedHotels}.demo`,
        check_in_time: '14:00',
        check_out_time: '12:00',
        is_active: true
      });

      // Manager
      const mEmail = `manager${importedHotels.toString().padStart(3, '0')}@smarthotel.demo`;
      const mName = `Manager of ${h.name}`;
      await User.create({
        full_name: mName,
        email: mEmail,
        password_hash: passHashManager,
        role: 'hotel_manager',
        hotel_id: hotel.id,
        phone_number: `+200000000${importedHotels}`
      });
      accMd += `| ${importedHotels} | ${hotel.name} | ${mName} | ${mEmail} | Manager@12345 |\n`;

      // Main Image record
      await HotelImage.create({
        hotel_id: hotel.id,
        image_url: `/images/hotels/hotel-${importedHotels}/main.jpg`,
        is_primary: true,
        display_order: 1
      });

      // Loyalty Rewards (Hotel Specific)
      await LoyaltyReward.create({ reward_name: '5% Discount', reward_type: 'percentage_discount', reward_value: 5, points_cost: 100, hotel_id: hotel.id, is_active: true });
      await LoyaltyReward.create({ reward_name: '20% Discount', reward_type: 'percentage_discount', reward_value: 20, points_cost: 300, hotel_id: hotel.id, is_active: true });

      // Amenities
      const hAmenities = dbAmenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
      for (const a of hAmenities) {
        await HotelAmenity.create({ hotel_id: hotel.id, amenity_id: a.id });
      }

      // Rooms
      const numRooms = Math.floor(Math.random() * 4) + 3;
      const hRooms = ROOM_TYPES.sort(() => 0.5 - Math.random()).slice(0, numRooms);
      for (const rt of hRooms) {
        const roomTotal = Math.floor(Math.random() * 15) + 5;
        // Occupancy test data: leave some rooms available, some booked
        const roomAvailable = Math.floor(Math.random() * roomTotal) + 1;
        
        const room = await Room.create({
          hotel_id: hotel.id,
          room_type: rt.type,
          description: `Spacious ${rt.type} room featuring modern amenities.`,
          price_per_night: rt.price + (stars * 20),
          capacity: rt.capacity,
          total_rooms: roomTotal,
          available_rooms: roomAvailable
        });
        
        // Create bookings if some rooms are occupied
        const booked = roomTotal - roomAvailable;
        if (booked > 0) {
          const cust = getRandom(customers);
          const checkIn = new Date();
          checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 10)); // Past or current
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 5) + 1);
          
          await Booking.create({
            user_id: cust.id,
            hotel_id: hotel.id,
            room_id: room.id,
            booking_reference: `BKG-${hotel.id}-${room.id}-${Math.floor(Math.random()*1000)}`,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price: room.price_per_night * booked,
            total_nights: Math.ceil((checkOut - checkIn) / 86400000), 
            status: 'confirmed',
            payment_status: 'paid',
            num_guests: room.capacity
          });
        }
      }

      // Reviews
      const numReviews = Math.floor(Math.random() * 12); // 0 to 11 reviews
      for (let r = 0; r < numReviews; r++) {
        const cust = getRandom(customers);
        const overall = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
        const comments = [
          `Great stay at ${h.name}!`, 
          `Loved the location and the service.`, 
          `Rooms were very clean.`, 
          `Would definitely recommend to friends.`, 
          `Good value for the price.`,
          `Exceptional experience from check-in to check-out.`,
          `Amenities were exactly as described.`,
          `Very comfortable beds and friendly staff.`
        ];
        
        await Review.create({
          user_id: cust.id,
          hotel_id: hotel.id,
          cleanliness_rating: overall,
          location_rating: overall,
          service_rating: overall,
          value_rating: overall,
          overall_rating: overall,
          comment: getRandom(comments),
          is_approved: true
        });
      }
      
      // Flash Deals
      if (Math.random() > 0.8) {
         await DynamicPricingRule.create({
           hotel_id: hotel.id,
           rule_type: 'flash_deal',
           adjustment_percentage: -20,
           start_date: new Date(Date.now() - 86400000),
           end_date: new Date(Date.now() + 86400000 * 3),
           is_active: true,
           description: 'Special Flash Deal! 20% Off!'
         });
      }

      if (importedHotels % 20 === 0) console.log(`Imported ${importedHotels} real hotels with unique images...`);
    }

    fs.writeFileSync(path.join(ROOT_DIR, 'FINAL_MANAGER_ACCOUNTS.md'), accMd);
    console.log("Generated FINAL_MANAGER_ACCOUNTS.md");

    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalManagers = await User.count({ where: { role: 'hotel_manager' } });
    const totalCustomers = await User.count({ where: { role: 'user' } });
    const totalHotels = await Hotel.count();
    const totalRooms = await Room.count();
    const totalBookings = await Booking.count();
    const totalReviews = await Review.count();
    const totalFlash = await DynamicPricingRule.count({ where: { rule_type: 'flash_deal' } });
    
    console.log('\n========================================');
    console.log('FINAL DATABASE VALIDATION');
    console.log('========================================');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admins: ${totalAdmins}`);
    console.log(`Hotel Managers: ${totalManagers}`);
    console.log(`Customers: ${totalCustomers}`);
    console.log(`Hotels: ${totalHotels}`);
    console.log(`Rooms: ${totalRooms}`);
    console.log(`Reviews: ${totalReviews}`);
    console.log(`Bookings: ${totalBookings}`);
    console.log(`Active Flash Deals: ${totalFlash}`);
    
    console.log('\nCities:');
    for (const c of Array.from(cityMap.values())) {
      const cCount = await Hotel.count({ where: { city_id: c.id } });
      console.log(`- ${c.name}, ${c.country} (${cCount} hotels)`);
    }

    const s2 = await Hotel.count({ where: { star_rating: 2 } });
    const s3 = await Hotel.count({ where: { star_rating: 3 } });
    const s4 = await Hotel.count({ where: { star_rating: 4 } });
    const s5 = await Hotel.count({ where: { star_rating: 5 } });
    console.log('\nStar distribution:');
    console.log(`2-star: ${s2}`);
    console.log(`3-star: ${s3}`);
    console.log(`4-star: ${s4}`);
    console.log(`5-star: ${s5}`);
    
    console.log('\n========================================');
    console.log('IMAGE VALIDATION');
    console.log('========================================');
    console.log(`Unique Main Images: ${imageHashes.size}`);
    
  } catch (err) {
    console.error("SEED ERROR:", err);
  } finally {
    process.exit(0);
  }
}

runSeed();
