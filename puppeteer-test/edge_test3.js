const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: 'new' 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Registering...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    const randomStr = Math.random().toString(36).substring(7);
    await page.type('input[name="full_name"]', 'Test User');
    await page.type('input[name="email"]', `testuser_${randomStr}@example.com`);
    await page.type('input[name="password"]', 'password123');
    await page.type('input[name="security_answer_1"]', 'dog');
    await page.type('input[name="security_answer_2"]', 'cat');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);

    console.log('Navigating to http://localhost:3000/trip-cost');
    await page.goto('http://localhost:3000/trip-cost', { waitUntil: 'networkidle0' });

    await new Promise(r => setTimeout(r, 2000));

    const pageContent = await page.evaluate(() => document.body.innerText);
    console.log('--- PAGE CONTENT ---');
    console.log(pageContent.substring(0, 500));

    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
