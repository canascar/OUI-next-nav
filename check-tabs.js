const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8030/#/sample-pages', { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(3000);

  // Click on "Favorite" chip
  await page.evaluate(() => {
    const chips = document.querySelectorAll('.emptySessionPage__chip');
    for (const chip of chips) {
      if (chip.textContent.includes('Favorite')) {
        chip.click();
        break;
      }
    }
  });
  await delay(500);

  const afterFav = await page.evaluate(() => {
    const listItems = document.querySelectorAll('.emptySessionPage__listItem');
    const tabContent = document.querySelector('.emptySessionPage__tabContent');
    return {
      listItemsCount: listItems.length,
      tabContentHTML: tabContent ? tabContent.innerHTML.substring(0, 800) : 'NOT FOUND',
      activeChip: document.querySelector('.emptySessionPage__chip--active')?.textContent?.trim(),
    };
  });
  console.log('After clicking Favorite:', JSON.stringify(afterFav, null, 2));

  // Click on "Recent"
  await page.evaluate(() => {
    const chips = document.querySelectorAll('.emptySessionPage__chip');
    for (const chip of chips) {
      if (chip.textContent.includes('Recent')) {
        chip.click();
        break;
      }
    }
  });
  await delay(500);

  const afterRecent = await page.evaluate(() => {
    const listItems = document.querySelectorAll('.emptySessionPage__listItem');
    return {
      listItemsCount: listItems.length,
      activeChip: document.querySelector('.emptySessionPage__chip--active')?.textContent?.trim(),
      firstItemText: listItems[0]?.textContent?.trim()?.substring(0, 100),
    };
  });
  console.log('\nAfter clicking Recent:', JSON.stringify(afterRecent, null, 2));

  // Take screenshot
  await page.screenshot({ path: '/Users/jasonlh/Desktop/KIRO/sample-pages-debug.png' });
  console.log('\nScreenshot saved to /Users/jasonlh/Desktop/KIRO/sample-pages-debug.png');

  await browser.close();
})();
