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

    page.on('console', msg => {
        console.log("BROWSER LOG:", msg.text());
    });

    console.log("Registering new user");
    await page.goto('http://127.0.0.1:3000/register', { waitUntil: 'domcontentloaded' });
    const ts = Date.now();
    await page.type('input[name="full_name"]', 'Test User');
    await page.type('input[name="email"]', `test${ts}@example.com`);
    await page.type('input[name="password"]', 'password123');
    await page.select('select[name="security_question_1"]', "What is your mother's maiden name?");
    await page.type('input[name="security_answer_1"]', 'Smith');
    await page.select('select[name="security_question_2"]', 'What was the name of your first pet?');
    await page.type('input[name="security_answer_2"]', 'Fido');
    
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));

    console.log("Opening Hotel 1");
    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'networkidle2' });
    
    console.log("Clicking Book");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.textContent.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: 'modal_before_click.png' });

    console.log("Clicking Add to Trip Plan");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent.includes('Add to Trip Plan'));
        if (addBtn) {
            console.log("Found button, outerHTML: ", addBtn.outerHTML);
            addBtn.click();
        } else {
            console.log("Button not found!");
        }
    });

    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'modal_after_click.png' });

    console.log("CURRENT URL:", await page.url());

    await browser.close();
})();
