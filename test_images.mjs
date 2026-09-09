import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  console.log("Checking Explore All Hotels (/hotels)...");
  await page.goto('http://localhost:3000/hotels', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  const allImages = await page.$$eval('img', imgs => imgs.map(img => img.src).filter(src => src.includes('/images/hotels')));
  console.log('Distinct rendered image src count:', new Set(allImages).size);
  console.log('First 5 images:', allImages.slice(0, 5));

  console.log("\nChecking Recommended for You (Home page)...");
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  const homeImages = await page.$$eval('img', imgs => imgs.map(img => img.src).filter(src => src.includes('/images/hotels')));
  console.log('Home distinct images:', new Set(homeImages).size);

  await browser.close();
})();
