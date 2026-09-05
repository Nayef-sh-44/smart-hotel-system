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
        if (msg.text().includes('[TRIP DEBUG]')) {
            console.log("BROWSER LOG:", msg.text());
        }
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
    
    console.log("Clicking Book on first AVAILABLE room");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.textContent.includes('Book') && !b.disabled);
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));

    console.log("Setting fields");
    await page.evaluate(() => {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        if (dateInputs.length >= 2) {
            dateInputs[0].value = '2026-10-01';
            dateInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            dateInputs[1].value = '2026-10-04';
            dateInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const numInputs = document.querySelectorAll('input[type="number"]');
        if (numInputs.length >= 2) {
            numInputs[0].value = 4;
            numInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            numInputs[1].value = 2;
            numInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    await new Promise(r => setTimeout(r, 1000));

    console.log("Clicking Add to Trip Plan");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent.includes('Add to Trip Plan'));
        if (addBtn) addBtn.click();
    });

    await new Promise(r => setTimeout(r, 3000));

    console.log("CURRENT URL:", await page.url());
    const title = await page.title();
    console.log("PAGE TITLE:", title);

    await page.screenshot({ path: 'trip_plan_final_test.png', fullPage: true });
    
    await browser.close();
})();
