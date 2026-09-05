const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'domcontentloaded' });
    const tripPlan = await page.evaluate(() => localStorage.getItem('tripPlan'));
    console.log("tripPlan in localStorage:", tripPlan);
    
    await browser.close();
})();
