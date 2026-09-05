const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 6000));
    
    const html = await page.evaluate(() => {
        const el = document.querySelector('h3:contains("Nearby Services")')?.closest('.border') || document.body;
        return document.body.innerHTML.substring(0, 1000); // just grab a chunk, wait better to grab the specific block
    });
    
    const nearbyHtml = await page.evaluate(() => {
        // Find the "Nearby Services" heading
        const headings = Array.from(document.querySelectorAll('h3'));
        const nearbyHeading = headings.find(h => h.innerText.includes('Nearby Services'));
        if (!nearbyHeading) return 'Heading not found';
        
        // Return the innerHTML of its parent container
        return nearbyHeading.parentElement.parentElement.innerHTML;
    });
    
    console.log("NEARBY HTML:\n", nearbyHtml);
    await browser.close();
})();
