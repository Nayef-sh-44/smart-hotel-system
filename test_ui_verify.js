const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1024});
  
  // Verify Hotel Detail
  await page.goto('http://localhost:3000/hotel/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'verify_nearby_ui.png' });
  
  // Verify Trip Type sorting
  try {
    // Click 'Business' trip type
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text === 'Business') {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'verify_trip_type.png' });
  } catch (e) {
    console.log(e);
  }

  // Verify Manager Base Price
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'manager@test.com');
  await page.type('input[type="password"]', 'password123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  
  await page.goto('http://localhost:3000/manager', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'verify_manager_ui.png' });

  await browser.close();
  console.log('Saved screenshots.');
})();
