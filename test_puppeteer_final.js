const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    // Log XHR/Fetch responses
    page.on('response', async response => {
        if (response.url().includes('/api/hotels/2/nearby-services')) {
            console.log('API STATUS:', response.status());
            try {
                console.log('API JSON:', await response.text());
            } catch (e) {}
        }
    });

    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    // Wait for the loader to disappear
    await page.waitForFunction(() => {
        return !document.body.innerText.includes("Scanning surrounding area");
    }, { timeout: 40000 }).catch(() => console.log("Timeout waiting for loader to disappear"));
    
    // Give time to render markers
    await new Promise(r => setTimeout(r, 2000));
    
    const count = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    const sidebarItems = await page.evaluate(() => document.querySelectorAll('.max-h-\\[400px\\] > div').length);
    console.log("Map markers count:", count);
    console.log("Sidebar items count:", sidebarItems);
    
    await browser.close();
})();
