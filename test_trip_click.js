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

    // Catch all console messages
    page.on('console', msg => {
        if (msg.text().includes('[TRIP DEBUG]')) {
            console.log("BROWSER LOG:", msg.text());
        }
    });

    console.log("1. Logging in");
    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'domcontentloaded' });
    await page.type('input[type="email"]', 'john@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));

    console.log("2. Opening Hotel 1");
    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    console.log("3. Clicking Book to open modal");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.innerText.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));

    console.log("4. Setting fields");
    await page.evaluate(() => {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        if (dateInputs.length >= 2) {
            dateInputs[0].value = '2026-10-01';
            dateInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            dateInputs[1].value = '2026-10-04';
            dateInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const numInputs = document.querySelectorAll('input[type="number"]');
        if (numInputs.length >= 2) {
            numInputs[0].value = 4;
            numInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            numInputs[1].value = 2;
            numInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    await new Promise(r => setTimeout(r, 1000));

    console.log("5. Clicking Add to Trip Plan");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.innerText.includes('Add to Trip Plan'));
        if (addBtn) addBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    console.log("CURRENT URL:", await page.url());

    console.log("SUCCESS");
    await browser.close();
})();
