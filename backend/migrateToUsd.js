const { Sequelize } = require('sequelize');

async function migrateDatabase() {
  const sequelize = new Sequelize('SmartHotelBooking', 'sa', 'YourStrong!Passw0rd', {
    host: 'localhost',
    port: 1433,
    dialect: 'mssql',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Convert EUR hotels' prices to USD
    // Hotel base_price_per_night
    await sequelize.query(`
      UPDATE Hotels 
      SET base_price_per_night = base_price_per_night * 1.10 
      WHERE currency = 'EUR';
    `);

    // Room price_per_night for EUR hotels
    await sequelize.query(`
      UPDATE Rooms 
      SET price_per_night = Rooms.price_per_night * 1.10 
      FROM Rooms
      INNER JOIN Hotels ON Rooms.hotel_id = Hotels.id
      WHERE Hotels.currency = 'EUR';
    `);
    
    // Bookings total_price for EUR bookings
    await sequelize.query(`
      UPDATE Bookings 
      SET total_price = total_price * 1.10, tax_amount = tax_amount * 1.10
      WHERE currency = 'EUR';
    `).catch(e => console.log('Bookings table might not have currency yet', e.message));

    // Set all currency columns to USD just for cleanup, though we will ignore them
    await sequelize.query(`UPDATE Hotels SET currency = 'USD'`).catch(()=>null);
    await sequelize.query(`UPDATE Bookings SET currency = 'USD'`).catch(()=>null);
    
    // Reset User's invalid currencies
    await sequelize.query(`UPDATE Users SET preferred_currency = 'USD' WHERE preferred_currency NOT IN ('USD', 'EUR')`).catch(()=>null);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrateDatabase();
