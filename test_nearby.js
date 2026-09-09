const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1024});
  await page.goto('http://localhost:3000/hotel/1', { waitUntil: 'networkidle0' });
  
  // wait for map to load
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'verify_nearby.png' });
  await browser.close();
  console.log('Saved verify_nearby.png');
})();
