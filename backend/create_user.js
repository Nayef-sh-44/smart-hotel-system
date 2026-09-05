const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('smarthotel', 'sa', 'SmartHotel@123', {
  host: '127.0.0.1',
  port: 1434,
  dialect: 'mssql',
});

(async () => {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await sequelize.query(`
      INSERT INTO Users (full_name, email, password_hash, role, preferred_currency) 
      VALUES ('Test User', 'john@example.com', '${hash}', 'customer', 'USD')
    `);
    console.log("User created!");
  } catch (err) {
    console.log("User might already exist or error:", err.message);
  }
  process.exit();
})();
