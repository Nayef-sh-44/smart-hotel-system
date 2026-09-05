const puppeteer = require('puppeteer-core');
const fs = require('fs');

const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        executablePath = p;
        break;
    }
}

if (!executablePath) {
    console.error("No browser found");
    process.exit(1);
}

(async () => {
    console.log("Using browser:", executablePath);
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    console.log("Navigating to http://localhost:3000/hotels/2...");
    await page.goto('http://localhost:3000/hotels/2', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 10000));
    
    // Evaluate some metrics
    const data = await page.evaluate(() => {
        const title = document.title;
        const markers = document.querySelectorAll('.leaflet-interactive').length;
        const sidebarItems = document.querySelectorAll('.max-h-\\[400px\\] > div').length;
        const debugText = document.body.innerText;
        return {
            title,
            markers,
            sidebarItems,
            hasError: debugText.includes("No nearby services")
        };
    });
    
    console.log("Results:", data);
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log("Saved screenshot.png");
    
    await browser.close();
})();
