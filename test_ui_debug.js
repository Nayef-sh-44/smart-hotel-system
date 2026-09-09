const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1024});
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if(!response.ok() && response.url().includes('api')) console.log('API ERROR:', response.url(), response.status());
  });

  await page.goto('http://localhost:3000/hotel/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
})();
