const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url().includes('localhost:5000')) {
            const newUrl = req.url().replace('localhost', '127.0.0.1');
            console.log("Redirecting to:", newUrl);
            req.continue({ url: newUrl });
        } else {
            req.continue();
        }
    });

    page.on('response', res => {
        if (res.url().includes('/api/hotels/2/nearby-services')) {
            console.log('RES:', res.status());
        }
    });
    
    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));
    
    const count = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    console.log("Map markers count:", count);
    await browser.close();
})();
