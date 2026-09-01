const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new' 
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000/trip-cost');
  await page.goto('http://localhost:3000/trip-cost', { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 2000));

  const pageContent = await page.evaluate(() => document.body.innerText);
  console.log('--- PAGE CONTENT ---');
  console.log(pageContent.substring(0, 500));

  await browser.close();
})();
