import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log("1. Visiting Home/Hotels page...");
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('.hotel-card');
  const hotels = await page.$$('.hotel-card');
  console.log(` -> Found ${hotels.length} hotels on home page.`);

  console.log("2. Testing Search...");
  await page.goto('http://localhost:3000/hotels');
  await page.waitForSelector('input[placeholder*="Search"]');
  await page.type('input[placeholder*="Search"]', 'London');
  await new Promise(r => setTimeout(r, 2000));
  const searchResults = await page.$$('.hotel-card');
  console.log(` -> Found ${searchResults.length} search results for London.`);

  console.log("3. Visiting Hotel Details...");
  // Click first hotel
  if (searchResults.length > 0) {
      await searchResults[0].click();
      await page.waitForNavigation();
      await page.waitForSelector('h1');
      const title = await page.$eval('h1', el => el.textContent);
      console.log(` -> On Hotel Details for: ${title}`);
      
      // 4. Map & Nearby
      const mapExists = await page.$('.leaflet-container');
      console.log(` -> Map renders: ${!!mapExists}`);
      
      // 12. Booking Test Setup
      const bookBtn = await page.$('button'); // Book Room
  }

  console.log("5. Testing Login...");
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'customer1@smarthotel.demo');
  await page.type('input[type="password"]', 'Customer@12345');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  console.log(" -> Logged in as Demo Customer 1.");

  console.log("11. Testing Loyalty...");
  await page.goto('http://localhost:3000/loyalty');
  await new Promise(r => setTimeout(r, 2000));
  console.log(" -> Visited Loyalty page.");

  console.log("13. Testing Trip Plan...");
  await page.goto('http://localhost:3000/trip-plan');
  await new Promise(r => setTimeout(r, 2000));
  console.log(" -> Visited Trip Plan page.");
  
  console.log("10. Testing Competitor Benchmarking as Manager...");
  // Logout
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'manager1@smarthotel.demo');
  await page.type('input[type="password"]', 'Manager@12345');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  console.log(" -> Logged in as Manager 1.");
  
  await page.goto('http://localhost:3000/manager/benchmarking');
  await new Promise(r => setTimeout(r, 4000));
  const charts = await page.$$('canvas');
  console.log(` -> Found ${charts.length} charts on Benchmarking dashboard.`);

  await browser.close();
  console.log("Browser Verification Complete.");
})();
