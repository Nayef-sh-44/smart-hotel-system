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

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    await new Promise(r => setTimeout(r, 6000));
    
    await page.screenshot({ path: 'screenshot_final.png', fullPage: true });
    
    const count = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    const sidebarItems = await page.evaluate(() => document.querySelectorAll('.max-h-\\[400px\\] > div').length);
    console.log("Map markers count:", count);
    console.log("Sidebar items count:", sidebarItems);
    
    await browser.close();
})();
