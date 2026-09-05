const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('ERR:', err.message));

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    console.log("Waiting for 30s...");
    await new Promise(r => setTimeout(r, 30000));
    
    await browser.close();
})();
