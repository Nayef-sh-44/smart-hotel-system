import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { 
  City, User, Hotel, Room, Amenity, HotelAmenity, RoomAmenity, 
  Booking, Review, Favorite, LoyaltyConfig, LoyaltyLevel, 
  LoyaltyReward, UserLoyalty, LoyaltyTransaction, UserRewardInstance,
  DynamicPricingRule, SavedComparison 
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

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

async function runSeed() {
  try {
    console.log("=== STARTING DEMO SEED ===");
    console.log("1. Syncing database (force: true) - This will drop all tables...");
    await sequelize.sync({ force: true });
    console.log("Database wiped and schema recreated.");

    const passHashCustomer = await bcrypt.hash('Demo@12345', 10);
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
        image_url: `https://ui-avatars.com/api/?name=${c.name}&background=random`,
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

    console.log("6. Creating Customers...");
    const dbCustomers = [];
    for (let i = 1; i <= 10; i++) {
      dbCustomers.push(await User.create({
        full_name: `Customer ${i}`,
        email: `customer${i.toString().padStart(2, '0')}@example.com`,
        password_hash: passHashCustomer,
        role: 'user',
        phone_number: `+100000000${i.toString().padStart(2, '0')}`
      }));
    }

    console.log("7. Creating Hotels & Managers...");
    const dbHotels = [];
    const dbManagers = [];
    let managerIndex = 1;

    for (let i = 0; i < 150; i++) {
      const city = getRandom(dbCities);
      const adj = getRandom(ADJECTIVES);
      const type = getRandom(TYPES);
      const hotelName = `${city.name} ${adj} ${type} ${Math.floor(Math.random()*1000)}`;
      
      // Slight random offset for hotel coords around city
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
        star_rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
        contact_phone: '+1234567890',
        contact_email: `info@hotel${i}.demo`,
        check_in_time: '14:00',
        check_out_time: '12:00',
        is_active: true
      });
      dbHotels.push(hotel);

      // Create Manager for this hotel
      if (i < 50) { // Only first 50 hotels get unique managers to save some time, rest can be manager-less or share
        const manager = await User.create({
          full_name: `Hotel Manager ${managerIndex}`,
          email: `manager${managerIndex.toString().padStart(2, '0')}@smarthotel.demo`,
          password_hash: passHashManager,
          role: 'hotel_manager',
          hotel_id: hotel.id,
          phone_number: `+200000000${managerIndex.toString().padStart(2, '0')}`
        });
        dbManagers.push(manager);
        managerIndex++;
      }

      // Add Amenities
      const hAmenities = dbAmenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
      for (const a of hAmenities) {
        await HotelAmenity.create({ hotel_id: hotel.id, amenity_id: a.id });
      }

      // Add Rooms
      const numRooms = Math.floor(Math.random() * 4) + 3; // 3 to 6
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

      // Dynamic Pricing (Randomly assign to ~20% of hotels)
      if (Math.random() < 0.2) {
        await DynamicPricingRule.create({
          hotel_id: hotel.id,
          name: 'Weekend Peak',
          condition_type: 'day_of_week',
          condition_value: '5,6', // Friday, Saturday
          price_multiplier: 1.25,
          is_active: true
        });
      }

      // Loyalty Rewards for this hotel
      await LoyaltyReward.create({
        hotel_id: hotel.id,
        reward_name: '5% Discount',
        reward_type: 'percentage_discount',
        reward_value: 5,
        points_cost: 300,
        is_active: true
      });
      await LoyaltyReward.create({
        hotel_id: hotel.id,
        reward_name: 'Free Breakfast',
        reward_type: 'fixed_discount',
        reward_value: 20,
        points_cost: 500,
        is_active: true
      });
    }

    console.log("8. Creating Bookings, Reviews, Favorites, Loyalty...");
    const loyaltyRecords = [];

    // Distribute logic across customers
    for (const cust of dbCustomers) {
      // Pick 3 random hotels to interact with (Favorites, Bookings)
      const interHotels = dbHotels.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      for (const h of interHotels) {
        // Favorite
        await Favorite.create({ user_id: cust.id, hotel_id: h.id });
        
        // Review
        const randomRating = Math.floor(Math.random() * 3) + 3; // 3 to 5
        await Review.create({
          user_id: cust.id,
          hotel_id: h.id,
          rating: randomRating, // old field
          overall_rating: randomRating,
          cleanliness_rating: randomRating,
          location_rating: randomRating,
          service_rating: randomRating,
          value_rating: randomRating,
          comment: `Great stay at ${h.name} in ${h.City?.name || 'this city'}!`,
        });

        // Booking
        const r = await Room.findOne({ where: { hotel_id: h.id } });
        if (r) {
          const earnedPoints = Math.floor(Number(r.price_per_night) * 3);
          const booking = await Booking.create({
            user_id: cust.id,
            hotel_id: h.id,
            room_id: r.id,
            booking_reference: `BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            check_in_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            check_out_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            total_nights: 3,
            num_guests: 1,
            total_price: earnedPoints,
            status: 'completed',
            special_requests: '',
            loyalty_points_earned: earnedPoints,
            loyalty_points_eligible: true
          });

          await UserLoyalty.create({
            user_id: cust.id,
            hotel_id: h.id,
            level_id: level1.id,
            current_points: earnedPoints,
            lifetime_points: earnedPoints
          });
          
          await LoyaltyTransaction.create({
            user_id: cust.id,
            hotel_id: h.id,
            transaction_type: 'earned',
            points: earnedPoints,
            description: `Earned from Booking #${booking.id}`,
            booking_id: booking.id
          });

          loyaltyRecords.push({ user: cust.email, hotel: h.name, points: earnedPoints });
        }
      }
    }

    // Add some Saved Comparisons for customer01
    await SavedComparison.create({
      user_id: dbCustomers[0].id,
      title: "Top Paris Hotels",
      hotel_ids: JSON.stringify(dbHotels.filter(h => h.name.includes('Paris')).slice(0,3).map(h => h.id))
    });

    console.log("9. Generating Markdown Reports...");
    
    // DEMO_ACCOUNTS.md
    let accMd = `# Demo Accounts\n\n| Type | Name | Email | Password | Role | Hotel |\n|---|---|---|---|---|---|\n`;
    accMd += `| Admin | System Admin | admin@smarthotel.demo | Admin@12345 | admin | - |\n`;
    for(const m of dbManagers.slice(0, 5)) {
      const mh = dbHotels.find(h => h.id === m.hotel_id);
      accMd += `| Manager | ${m.full_name} | ${m.email} | Manager@12345 | hotel_manager | ${mh?.name} |\n`;
    }
    for(const c of dbCustomers.slice(0, 5)) {
      accMd += `| Customer | ${c.full_name} | ${c.email} | Demo@12345 | customer | - |\n`;
    }
    fs.writeFileSync(path.join(ROOT_DIR, 'DEMO_ACCOUNTS.md'), accMd);

    // HOTEL_DEMO_DATA.md
    let hotMd = `# Demo Hotels (150 Total)\n\n| ID | Hotel Name | City | Country | Base Price | Rating |\n|---|---|---|---|---|---|\n`;
    for(const h of dbHotels) {
      const c = dbCities.find(c => c.id === h.city_id);
      hotMd += `| ${h.id} | ${h.name} | ${c?.name} | ${c?.country} | ${h.base_price_per_night} | ${h.star_rating} |\n`;
    }
    fs.writeFileSync(path.join(ROOT_DIR, 'HOTEL_DEMO_DATA.md'), hotMd);

    // LOYALTY_DEMO_DATA.md
    let loyMd = `# Loyalty Test Data\n\n| User Email | Hotel | Points Earned |\n|---|---|---|\n`;
    for(const l of loyaltyRecords) {
      loyMd += `| ${l.user} | ${l.hotel} | ${l.points} |\n`;
    }
    fs.writeFileSync(path.join(ROOT_DIR, 'LOYALTY_DEMO_DATA.md'), loyMd);

    console.log("\n=== SEED COMPLETE ===");
    console.log(`Users: ${await User.count()} (1 Admin, ${dbManagers.length} Managers, ${dbCustomers.length} Customers)`);
    console.log(`Hotels: ${await Hotel.count()}`);
    console.log(`Cities: ${await City.count()}`);
    console.log(`Rooms: ${await Room.count()}`);
    console.log(`Bookings: ${await Booking.count()}`);
    console.log(`Reviews: ${await Review.count()}`);
    console.log(`Favorites: ${await Favorite.count()}`);
    console.log(`Loyalty Accounts: ${await UserLoyalty.count()}`);
    console.log(`Loyalty Rewards: ${await LoyaltyReward.count()}`);
    console.log(`Dynamic Pricing Rules: ${await DynamicPricingRule.count()}`);
    console.log(`Saved Comparisons: ${await SavedComparison.count()}`);

  } catch (err) {
    console.error("SEED ERROR:", err);
  } finally {
    process.exit(0);
  }
}

runSeed();
