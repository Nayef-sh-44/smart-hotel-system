const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    
    await new Promise(r => setTimeout(r, 4000));
    
    // Explicitly test the fetch call
    const fetchResult = await page.evaluate(async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/hotels/2/nearby-services');
            const json = await res.json();
            return json;
        } catch (e) {
            return { error: e.message };
        }
    });
    
    console.log("FETCH FROM BROWSER:", fetchResult);
    
    await browser.close();
})();
