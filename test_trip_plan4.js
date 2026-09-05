const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const downloadPath = path.resolve('./downloads');
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    await page.setViewport({ width: 1280, height: 1024 });
    page.setDefaultNavigationTimeout(60000);
    
    // Login
    console.log("1. Logging in");
    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'john@example.com');
    await page.type('input[type="password"]', 'password123');
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    console.log("2. Navigating to Hotel Details page");
    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'networkidle2' });
    
    console.log("3. Selecting Room and Dates");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.innerText.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
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
    
    console.log("4. Verifying 'Add to Trip' is visible and clicking it");
    const addedToTrip = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add to Trip'));
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });
    
    if (!addedToTrip) {
        console.error("FAIL: Add to Trip button not found");
        process.exit(1);
    }
    
    console.log("5. Waiting for navigation to trip-cost");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000)); // wait for API pricing
    
    console.log("6. Verifying totals and Download PDF button");
    const valid = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('GRAND TOTAL') && text.includes('Download Professional PDF');
    });
    
    if (!valid) {
        console.error("FAIL: Trip Cost page did not render correctly");
        await page.screenshot({ path: 'fail_trip_cost.png' });
        process.exit(1);
    }
    
    console.log("7. Clicking Download PDF");
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download Professional PDF'));
        if (btn) btn.click();
    });
    
    console.log("8. Waiting for PDF download to complete");
    await new Promise(r => setTimeout(r, 3000));
    
    const files = fs.readdirSync(downloadPath);
    const pdfs = files.filter(f => f.endsWith('.pdf'));
    
    if (pdfs.length > 0) {
        console.log("SUCCESS! PDF downloaded: " + pdfs[0]);
    } else {
        console.error("FAIL: No PDF found in downloads directory");
    }
    
    await browser.close();
})();
