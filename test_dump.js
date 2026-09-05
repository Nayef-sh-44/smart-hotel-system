const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERR:', err.message));

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));
    
    // Evaluate if there are any specific errors
    const isFetching = await page.evaluate(() => document.body.innerText.includes("Scanning"));
    console.log("Is Fetching:", isFetching);
    await browser.close();
})();
