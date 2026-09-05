const puppeteer = require('puppeteer');

const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Starting Benchmarking E2E Verification...");
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    const testEmail = 'manager_' + Date.now() + '@example.com';

    console.log("Registering test manager...");
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(async (email) => {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Test Manager',
          email: email,
          password: 'password123',
          role: 'hotel_manager',
          hotel_id: 1,
          security_question_1: 'What is your city?',
          security_answer_1: 'x',
          security_question_2: 'What is your favorite color?',
          security_answer_2: 'y'
        })
      });
      return await res.json();
    }, testEmail);
    console.log("Registration API:", result);

    // 1. Go to Login
    await page.goto('http://localhost:3000/login');
    await wait(2000);
    
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await wait(3000);

    // 2. Go to Benchmarking Page
    console.log("Navigating to /manager/benchmarking...");
    await page.goto('http://localhost:3000/manager/benchmarking');
    await wait(3000);

    // 3. Take screenshot
    await page.screenshot({ path: 'benchmarking_dashboard.png', fullPage: true });

    // 4. Verify text on page
    const content = await page.content();
    if (content.includes('Competitor Benchmarking')) {
      console.log('SUCCESS: Benchmarking dashboard loaded.');
    } else {
      console.log('FAILED: Benchmarking title not found.');
    }
    
    if (content.includes('Average Price') && content.includes('Occupancy Rate') && content.includes('Guest Rating')) {
      console.log('SUCCESS: Metric cards are present.');
    } else {
      console.log('FAILED: Metric cards missing.');
    }

    if (content.includes('Performance vs Market')) {
      console.log('SUCCESS: Comparison table is present.');
    } else {
      console.log('FAILED: Comparison table missing.');
    }

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await browser.close();
  }
})();
