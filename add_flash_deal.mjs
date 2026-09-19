import { Sequelize } from 'sequelize';

const masterSeq = new Sequelize('HotelBookingDB', 'sa', 'SmartHotel2026!', {
    host: 'localhost',
    port: 1434,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
        },
    },
    logging: false,
});

async function addDeal() {
    await masterSeq.authenticate();
    
    // Check if one already exists to prevent duplication on multiple runs
    const [existing] = await masterSeq.query(`SELECT id FROM flash_deals WHERE hotel_id = 1 AND active_status = 1`);
    if(existing.length === 0) {
        await masterSeq.query(`
            INSERT INTO flash_deals 
            (hotel_id, title, description, discount_percentage, discount_type, discount_value, start_datetime, end_datetime, remaining_rooms, active_status, created_at, updated_at, priority)
            VALUES 
            (1, 'Agent 20% Mega Deal', 'Special temporary flash deal!', 20.00, 'percentage', null, GETDATE(), DATEADD(day, 3, GETDATE()), 5, 1, GETDATE(), GETDATE(), 100)
        `);
        console.log("Added Flash Deal for Hotel 1");
    } else {
        console.log("Flash Deal already exists");
    }
}
addDeal().catch(console.error).finally(() => process.exit(0));
