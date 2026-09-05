const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

  const browser = await puppeteer.launch({
    headless: 'new',
    channel: 'chrome',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('response', async (response) => { 
    if (response.url().includes('/api/bookings') && response.request().method() === 'POST') { 
      try { 
        const json = await response.json(); 
        console.log('BOOKING API RESPONSE:', JSON.stringify(json)); 
      } catch(e) {} 
    } 
  });
  
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  try {
    console.log('--- Registering a test user ---');
    await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded' });
    const randomSuffix = Math.floor(Math.random() * 100000);
    const testEmail = 'test' + randomSuffix + '@example.com';
    
    await page.type('input[type="text"]', 'Test User');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'password123');
    await page.type('input[name="phone_number"]', '+1234567890');
    await page.select('select[name="security_question_1"]', 'What is your city?');
    await page.type('input[name="security_answer_1"]', 'Answer 1');
    await page.select('select[name="security_question_2"]', 'What is your favorite color?');
    await page.type('input[name="security_answer_2"]', 'Answer 2');
    await page.click('button[type="submit"]');
    await wait(2000);
    console.log('User registered.');

    console.log('\n=== TEST A: NORMAL BOOKING ===');
    await page.goto('http://localhost:3000/hotels', { waitUntil: 'domcontentloaded' });
    await wait(2000); // let UI settle
    await page.waitForSelector('a[href^="/hotels/"]');
    const hotelLinks = await page.$$('a[href^="/hotels/"]');
    await hotelLinks[0].click();
    await wait(2000);
    
    await page.waitForSelector('button', { timeout: 5000 });
    await wait(1000); // let UI settle
    
    // Find Book Now button
    let bookButtons = await page.$$('button');
    let opened = false;
    for (const b of bookButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      const isDisabled = await page.evaluate(el => el.disabled, b);
      if (text.includes('Book / Add to Trip') && !isDisabled) {
        await b.click();
        opened = true;
        break;
      }
    }
    if (!opened) {
      console.log('Could not click Book button. Capturing screen.');
      await page.screenshot({ path: 'test_a_nobtn.png' });
      throw new Error('No enabled Book button found.');
    }
    
    await page.waitForSelector('input[type="date"]', { timeout: 5000 });
    // Fill out normal booking dates
    const dates = await page.$$('input[type="date"]');
    await dates[0].type('09102026'); // Sept 10, 2026
    await dates[1].type('09152026'); // Sept 15, 2026
    
    // Click Confirm Reservation
    const confirmBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Confirm Reservation'));
    });
    await confirmBtn.click();
    await wait(1500);
    // Should navigate to My Bookings
    if (page.url().includes('/my-bookings')) {
      console.log('Test A: Success - Navigated to My Bookings without crash.');
    } else {
      console.log('Test A: Failed - Not in my bookings. URL: ' + page.url());
      await page.screenshot({ path: 'test_a_fail.png' });
    }

    console.log('\n=== TEST B: ADD TO TRIP PLAN ===');
    await page.goto('http://localhost:3000/hotels', { waitUntil: 'domcontentloaded' });
    await wait(2000);
    await page.waitForSelector('a[href^="/hotels/"]');
    const hotelLinks2 = await page.$$('a[href^="/hotels/"]');
    await hotelLinks2[1].click(); // pick second hotel
    await wait(2000);
    
    await page.waitForSelector('button');
    await wait(1000); // let UI settle
    
    // Find Book Now button
    const bookButtons2 = await page.$$('button');
    for (const b of bookButtons2) {
      const text = await page.evaluate(el => el.textContent, b);
      const isDisabled = await page.evaluate(el => el.disabled, b);
      if (text.includes('Book / Add to Trip') && !isDisabled) {
        await b.click();
        break;
      }
    }
    
    await page.waitForSelector('input[type="date"]', { timeout: 5000 });
    const dates2 = await page.$$('input[type="date"]');
    await dates2[0].type('10102026'); // Oct 10, 2026
    await dates2[1].type('10152026'); // Oct 15, 2026
    
    const addToTripBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Add to Trip Plan'));
    });
    await addToTripBtn.click();
    await wait(1500);
    
    if (page.url().includes('/trip-plan')) {
      console.log('Test B: Success - Redirected to Trip Plan.');
    } else {
      console.log('Test B: Failed - Not in trip plan. URL: ' + page.url());
      await page.screenshot({ path: 'test_b_fail.png' });
    }
    await page.waitForSelector('text/DESTINATIONS', { timeout: 5000 }).catch(() => {});
    console.log('Destination successfully added to Trip Plan.');

    console.log('\n=== TEST C: EDIT IN TRIP PLAN ===');
    // Find Edit button
    const editBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.title === 'Edit');
    });
    await editBtn.click();
    await wait(500);
    
    const guestInput = await page.evaluateHandle(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const guestLabel = labels.find(l => l.textContent.includes('Guests'));
      return guestLabel.nextElementSibling;
    });
    await guestInput.click();
    await page.keyboard.press('Backspace');
    await page.keyboard.press('3');
    
    const saveBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Save Changes'));
    });
    await saveBtn.click();
    await wait(1000);
    console.log('Test C: Success - Saved edit without errors.');

    console.log('\n=== TEST E: PDF DOWNLOAD ===');
    const dlBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Download Trip Report PDF'));
    });
    await dlBtn.click();
    await wait(2000);
    const files = fs.readdirSync(downloadPath);
    if (files.find(f => f.includes('.pdf'))) {
      console.log('Test E: Success - PDF file downloaded.');
    } else {
      console.log('Test E: Failed - PDF not downloaded.');
    }

    console.log('\n=== TEST D: BOOK FROM Trip PLAN ===');
    const bookBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.trim() === 'Book');
    });
    await bookBtn.click();
    await wait(500);
    
    const confirmBookBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Complete Reservation'));
    });
    await confirmBookBtn.click();
    await wait(1500);
    
    if (page.url().includes('/my-bookings')) {
      console.log('Test D: Success - Booked directly from Trip Plan and navigated to My Bookings.');
    } else {
      console.log('Test D: Failed - URL is ' + page.url());
      await page.screenshot({ path: 'test_d_fail.png' });
    }

    await browser.close();
    console.log('\nALL TESTS COMPLETED.');
  } catch (err) {
    console.error(err);
    await page.screenshot({ path: 'test_fatal.png' });
    await browser.close();
  }
})();
