import { sequelize } from './src/models/index.js';
(async () => {
  await sequelize.query('DELETE FROM Bookings');
  console.log("Bookings cleared.");
  process.exit(0);
})();
