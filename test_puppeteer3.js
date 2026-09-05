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
        if(msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
        else console.log('LOG:', msg.text());
    });
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', request => console.log('FAILED REQ:', request.url(), request.failure().errorText));
    
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 8000));
    
    await browser.close();
})();
