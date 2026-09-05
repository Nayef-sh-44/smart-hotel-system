const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    page.setDefaultNavigationTimeout(60000);
    
    console.log("Navigating to Hotel 2");
    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Select Room
    console.log("Selecting Room");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.innerText.includes('Book Room'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Set dates
    console.log("Setting dates");
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="date"]');
        if (inputs.length >= 2) {
            inputs[0].value = '2026-10-01';
            inputs[1].value = '2026-10-05';
            inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Click Add to Trip
    console.log("Clicking Add to Trip");
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add to Trip'));
        if (btn) btn.click();
    });
    
    console.log("Waiting for navigation to trip-cost");
    await new Promise(r => setTimeout(r, 3000)); // wait for navigation and API
    
    console.log("Taking screenshot");
    await page.screenshot({ path: 'screenshot_trip_plan.png', fullPage: true });
    
    await browser.close();
})();
