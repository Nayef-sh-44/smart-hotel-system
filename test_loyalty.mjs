import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/login');
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'test_redeem@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  console.log("Logged in!");

  console.log("Navigating to loyalty page...");
  await page.goto('http://localhost:3000/loyalty');
  await new Promise(r => setTimeout(r, 4000));

  console.log("Clicking hotel card to expand...");
  const cards = await page.$$('div.cursor-pointer');
  if (cards.length > 0) { 
    await cards[0].click(); 
    await new Promise(r => setTimeout(r, 2000)); 
  }

  await page.screenshot({ path: 'loyalty_before.png' });
  console.log("Screenshot saved to loyalty_before.png");

  console.log("Looking for Redeem Now buttons...");
  const redeemButtons = await page.$$('button');
  let redeemBtn = null;
  for (const btn of redeemButtons) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Redeem Now') {
      redeemBtn = btn;
      break;
    }
  }

  if (redeemBtn) {
    console.log("Found Redeem Now button. Clicking...");
    await redeemBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'loyalty_after.png' });
    console.log("Screenshot saved to loyalty_after.png");
  } else {
    console.log("No Redeem Now button found.");
  }

  console.log("Navigating to Hotel 1 detail...");
  await page.goto('http://localhost:3000/hotel/1');
  await new Promise(r => setTimeout(r, 4000));
  
  const bookBtns = await page.$$('button');
  for (const btn of bookBtns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Book Room') {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'booking_modal.png' });
  console.log("Screenshot saved to booking_modal.png");

  await browser.close();
})();
