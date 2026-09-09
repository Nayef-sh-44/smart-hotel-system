const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1024});
  await page.goto('http://localhost:3000/hotel/1?check_in_date=2026-09-09&check_out_date=2026-09-12', { waitUntil: 'networkidle0' });
  
  // click book now
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Book Now')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'verify_modal.png' });
  await browser.close();
  console.log('Saved verify_modal.png');
})();
