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

    page.on('console', msg => console.log("BROWSER LOG:", msg.text()));

    console.log("Mocking Local Storage for Auth");
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            email: 'john@example.com',
            full_name: 'John Doe',
            token: 'mock-token-123'
        }));
    });

    console.log("Opening Hotel 1");
    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'networkidle2' });
    
    console.log("Clicking Book");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.textContent.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));

    console.log("Checking if modal opened");
    await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            console.log("MODAL FOUND! Outer HTML:");
            console.log(modal.outerHTML);
        } else {
            console.log("NO MODAL FOUND!");
        }
    });

    await browser.close();
})();
