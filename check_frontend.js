const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('PAGE EXCEPTION:', err.toString());
  });
  
  await page.goto('http://localhost:3000/calculator', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Checking for content...');
  const body = await page.evaluate(() => document.body.innerHTML);
  if (body.includes('Trip Cost Calculator')) {
    console.log('Calculator is visible!');
  } else {
    console.log('Calculator is NOT visible. Blank screen?');
  }
  
  await browser.close();
})();
