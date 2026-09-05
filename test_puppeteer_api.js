const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.text().includes('[NEARBY')) console.log('PAGE LOG:', msg.text());
    });
    
    console.log("Navigating...");
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 12000));
    await browser.close();
})();
