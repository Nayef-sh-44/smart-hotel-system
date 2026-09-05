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
    page.setDefaultNavigationTimeout(60000);

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    // Wait for the loader to disappear, up to 40 seconds!
    console.log("Waiting for loader to disappear... (max 40s)");
    await page.waitForFunction(() => {
        return !document.body.innerText.includes("Scanning surrounding area");
    }, { timeout: 40000 }).catch(() => console.log("Timeout waiting for loader to disappear"));
    
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'screenshot_final6.png', fullPage: true });
    
    const count = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    const sidebarItems = await page.evaluate(() => document.querySelectorAll('.max-h-\\[400px\\] > div').length);
    console.log("Map markers count:", count);
    console.log("Sidebar items count:", sidebarItems);
    
    await browser.close();
})();
