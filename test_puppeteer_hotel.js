const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    const fetchResult = await page.evaluate(async () => {
        const res = await fetch('http://127.0.0.1:5000/api/hotels/2');
        return await res.json();
    });
    
    console.log("HOTEL DETAILS:", fetchResult);
    await browser.close();
})();
