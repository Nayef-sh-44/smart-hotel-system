const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log("BROWSER LOG:", msg.text()));

    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'domcontentloaded' });
    await page.type('input[type="email"]', 'john@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));

    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.innerText.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            console.log("MODAL HTML:");
            console.log(modal.outerHTML);
        } else {
            console.log("NO MODAL FOUND!");
        }
    });

    await browser.close();
})();
