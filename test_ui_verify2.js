const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1024});
  
  await page.goto('http://localhost:3000/hotel/1', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  // Scroll to bottom so we can see the map
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'verify_nearby_ui_final.png', fullPage: true });

  await browser.close();
  console.log('Saved screenshot.');
})();
