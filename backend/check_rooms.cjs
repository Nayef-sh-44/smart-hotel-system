const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('smarthotel', 'sa', 'SmartHotel@123', {
  host: '127.0.0.1',
  port: 1434,
  dialect: 'mssql',
});

(async () => {
  try {
    const [results, metadata] = await sequelize.query(`SELECT id, status, available_rooms, is_available FROM Rooms WHERE hotel_id = 1`);
    console.log(results);
  } catch (err) {
    console.error(err);
  }
  process.exit();
})();
