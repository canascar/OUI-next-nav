const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'do-not-commit-to-git/Mascot behavior - standalone.html');
  console.log('Opening:', filePath);
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(5000);

  // Get the rendered text content
  const textContent = await page.evaluate(() => {
    return document.body.innerText;
  });

  // Get headings and structure
  const structure = await page.evaluate(() => {
    const sections = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
      sections.push({ tag: h.tagName, text: h.textContent.trim() });
    });
    return sections;
  });

  // Get the full HTML
  const html = await page.content();

  fs.writeFileSync('/tmp/mascot-behavior-text.txt', textContent);
  fs.writeFileSync('/tmp/mascot-behavior-structure.json', JSON.stringify(structure, null, 2));
  fs.writeFileSync('/tmp/mascot-behavior-full.html', html);

  console.log('\n=== HEADINGS ===');
  structure.forEach(s => console.log(`${s.tag}: ${s.text}`));
  console.log('\n=== TEXT (first 3000 chars) ===');
  console.log(textContent.substring(0, 3000));

  await page.screenshot({ path: '/tmp/mascot-behavior-screenshot.png', fullPage: true });
  console.log('\nScreenshot saved.');

  await browser.close();
})();
