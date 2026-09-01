import app from './app.js';
import sequelize, { ensureDatabaseExists } from './config/database.js';
import { sequelize as modelSequelize } from './models/index.js';
import { autoSeedIfEmpty } from './seed/autoSeed.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ensureDatabaseExists();

    console.log('Connecting to SQL Server (HotelBookingDB)...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Synchronizing Sequelize models...');
    await modelSequelize.sync({ alter: false });
    console.log('Models synchronized.');

    // await autoSeedIfEmpty();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`SmartHotelBooking Backend server is running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await sequelize.close();
        console.log('Server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

startServer();
