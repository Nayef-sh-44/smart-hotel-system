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

    console.log('Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    await page.type('input[type="email"]', 'admin@smarthotel.demo');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Login successful');

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
