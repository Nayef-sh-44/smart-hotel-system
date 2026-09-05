const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    console.log("Navigating...");
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    console.log("Done");
    await browser.close();
})();
