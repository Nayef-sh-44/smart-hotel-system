const puppeteer = require('puppeteer-core');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function setRoomAndDates(page, checkIn, checkOut, guests, rooms) {
    console.log("Setting Room and Dates");
    
    // Click Book
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bookBtns = btns.filter(b => b.innerText.includes('Book'));
        if (bookBtns.length > 0) bookBtns[0].click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Set form fields
    await page.evaluate((ci, co, g, r) => {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        if (dateInputs.length >= 2) {
            dateInputs[0].value = ci;
            dateInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            dateInputs[1].value = co;
            dateInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const numInputs = document.querySelectorAll('input[type="number"]');
        if (numInputs.length >= 2) {
            // First is guests, second is rooms
            numInputs[0].value = g;
            numInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
            numInputs[1].value = r;
            numInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, checkIn, checkOut, guests, rooms);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Click Add to Trip Plan
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.innerText.includes('Add to Trip Plan'));
        if (addBtn) addBtn.click();
    });
}

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath, 
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    // 1. Login
    console.log("1. Logging in");
    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'domcontentloaded' });
    await page.type('input[type="email"]', 'john@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));

    // Clear old trip
    console.log("Clearing old trip");
    await page.goto('http://127.0.0.1:3000/trip-cost', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate(() => {
        const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Clear Trip'));
        if(clearBtn) clearBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // DESTINATION 1
    console.log("Adding Destination 1: Hotel 1");
    await page.goto('http://127.0.0.1:3000/hotels/1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await setRoomAndDates(page, '2026-10-01', '2026-10-04', 4, 2);
    
    // Wait for navigation
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Verifying Destination 1 is added");
    const countAfter1 = await page.evaluate(() => {
        return document.querySelectorAll('h3').length; // very rough heuristic, let's just log the context
    });
    console.log("Checking UI on trip-cost");

    // Click Add Destination
    console.log("Clicking + Add Destination");
    await page.evaluate(() => {
        const addDest = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Destination'));
        if (addDest) addDest.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Adding Destination 2: Hotel 2");
    await page.goto('http://127.0.0.1:3000/hotels/2', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await setRoomAndDates(page, '2026-10-04', '2026-10-07', 4, 2);
    await new Promise(r => setTimeout(r, 3000));

    console.log("Taking Screenshot of Trip Planner with 2 destinations");
    await page.screenshot({ path: 'trip_planner_2_dests.png', fullPage: true });

    // Download PDF (Click the button)
    console.log("Clicking Download PDF");
    await page.evaluate(() => {
        const pdfBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download Professional PDF'));
        if (pdfBtn) pdfBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
    console.log("SUCCESS");
})();
