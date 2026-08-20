import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isDocker = process.env.DOCKER_ENV === 'true' || process.env.DB_HOST === 'sqlserver';

let sequelize;

if (isDocker) {
  // Docker / Linux container mode using pure-JS 'tedious' driver over TCP/IP
  sequelize = new Sequelize(
    process.env.DB_NAME || 'HotelBookingDB',
    process.env.DB_USER || 'sa',
    process.env.DB_PASSWORD || 'SmartHotel2026!',
    {
      host: process.env.DB_HOST || 'sqlserver',
      port: Number(process.env.DB_PORT || 1433),
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    }
  );
} else {
  // Local Windows mode using native ODBC driver (msnodesqlv8)
  const { default: msnodesqlv8 } = await import('sequelize-msnodesqlv8');
  sequelize = new Sequelize({
    dialect: 'mssql',
    dialectModule: msnodesqlv8,
    dialectOptions: {
      options: {
        connectionString:
          process.env.DB_CONNECTION_STRING ||
          'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=HotelBookingDB;Trusted_Connection=yes;',
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

export const ensureDatabaseExists = async () => {
  if (!isDocker) return;
  const masterSeq = new Sequelize(
    'master',
    process.env.DB_USER || 'sa',
    process.env.DB_PASSWORD || 'SmartHotel2026!',
    {
      host: process.env.DB_HOST || 'sqlserver',
      port: Number(process.env.DB_PORT || 1433),
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      logging: false,
    }
  );

  const dbName = process.env.DB_NAME || 'HotelBookingDB';
  console.log(`[Docker DB] Ensuring database [${dbName}] exists on SQL Server...`);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    try {
      await masterSeq.authenticate();
      connected = true;
      break;
    } catch (err) {
      console.log(`[Docker DB] Waiting for SQL Server container to accept TCP connections (${i + 1}/30)...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!connected) {
    throw new Error('Unable to connect to SQL Server container after 60 seconds.');
  }

  const [res] = await masterSeq.query(`SELECT name FROM sys.databases WHERE name = N'${dbName}'`);
  if (res.length === 0) {
    console.log(`[Docker DB] Database [${dbName}] not found. Creating database...`);
    await masterSeq.query(`CREATE DATABASE [${dbName}]`);
    console.log(`[Docker DB] Database [${dbName}] created successfully.`);
  } else {
    console.log(`[Docker DB] Database [${dbName}] already exists.`);
  }

  await masterSeq.close();
};

export default sequelize;
