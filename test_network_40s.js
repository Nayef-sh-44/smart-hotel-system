const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    
    page.on('request', req => {
        if (req.url().includes('/api/')) console.log('REQ:', req.method(), req.url());
    });
    page.on('response', res => {
        if (res.url().includes('/api/')) console.log('RES:', res.status(), res.url());
    });
    page.on('requestfailed', req => {
        if (req.url().includes('/api/')) console.log('FAIL:', req.url(), req.failure()?.errorText);
    });

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    console.log("Waiting 30 seconds...");
    await new Promise(r => setTimeout(r, 30000));
    
    const count = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    console.log("Map markers count:", count);
    
    await browser.close();
})();
