const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8030/#/sample-pages', { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(3000);

  // Check what's visible
  const content = await page.evaluate(() => {
    const chips = document.querySelectorAll('.emptySessionPage__chip');
    const listItems = document.querySelectorAll('.emptySessionPage__listItem');
    const tabContent = document.querySelector('.emptySessionPage__tabContent');
    const panel = document.querySelector('.emptySessionPage__panel');
    const header = document.querySelector('.emptySessionPage__header');
    
    return {
      chipsCount: chips.length,
      chipTexts: Array.from(chips).map(c => c.textContent.trim()),
      listItemsCount: listItems.length,
      tabContentExists: !!tabContent,
      tabContentHTML: tabContent ? tabContent.innerHTML.substring(0, 500) : 'NOT FOUND',
      panelExists: !!panel,
      headerExists: !!header,
      headerText: header ? header.textContent.trim() : 'NOT FOUND',
    };
  });

  console.log('Page state:', JSON.stringify(content, null, 2));
  console.log('\nJS Errors:', errors.length ? errors.join('\n') : 'None');

  await browser.close();
})();
