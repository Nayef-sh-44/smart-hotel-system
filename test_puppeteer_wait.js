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
    
    page.setDefaultNavigationTimeout(60000); // 60s
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log("Navigating to http://localhost:3000/hotels/2...");
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    console.log("Waiting for fetching to complete (up to 50s)...");
    await page.waitForFunction(() => {
        const text = document.body.innerText;
        return !text.includes("Scanning surrounding area");
    }, { timeout: 50000 }).catch(() => console.log("Timeout waiting for loader to disappear"));
    
    // Give it 2 seconds to render markers
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'screenshot_success.png', fullPage: true });
    
    const count = await page.evaluate(() => {
        return document.querySelectorAll('.leaflet-interactive').length;
    });
    const sidebarItems = await page.evaluate(() => {
        return document.querySelectorAll('.max-h-\\[400px\\] > div').length;
    });
    console.log("Map markers count:", count);
    console.log("Sidebar items count:", sidebarItems);
    
    await browser.close();
})();
