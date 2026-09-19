import { getCompetitorBenchmarking } from './backend/src/controllers/managerController.js';

const mockReq = (start_date, end_date) => ({
    user: { hotel_id: 1 },
    query: { start_date, end_date }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};

async function testApi(start, end) {
    const req = mockReq(start, end);
    const res = mockRes();
    await getCompetitorBenchmarking(req, res, console.error);
    console.log(`Period: ${start} -> ${end}`);
    if (res.data && res.data.success) {
        const d = res.data.data;
        console.log(`  Price: My=$${d.myHotel.avg_base_price}, Mkt=$${d.marketAverage.avg_base_price}`);
        console.log(`  Occ: My=${d.myHotel.occupancy_rate}%, Mkt=${d.marketAverage.avg_occupancy_rate}%`);
    } else {
        console.log('Error:', res);
    }
}

async function run() {
    await testApi('2026-06-01', '2026-06-30');
    await testApi('2026-09-01', '2026-09-30');
}

run().catch(console.error).finally(() => process.exit(0));
