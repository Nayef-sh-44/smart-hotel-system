const puppeteer = require('puppeteer-core');
const fs = require('fs');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log("TEXT EXTRACT:\n", text.substring(0, 1000));
    const isScanning = text.includes("Scanning surrounding area");
    const isFetching = text.includes("Fetching real-time OpenStreetMap");
    console.log("Scanning:", isScanning, "Fetching:", isFetching);
    
    await browser.close();
})();
