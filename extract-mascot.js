const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'Welcome page v4 _standalone_.html');
  console.log('Opening:', filePath);
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(5000);

  // Get the full rendered HTML
  const html = await page.content();
  fs.writeFileSync('/Users/jasonlh/Desktop/KIRO/OUI-next-navigation-sicheng/welcome-rendered.html', html);
  console.log('Rendered HTML saved to welcome-rendered.html');
  console.log('HTML length:', html.length);

  // Try to find SVG elements or the mascot
  const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length);
  console.log('SVG elements found:', svgCount);

  // Get all SVGs
  const svgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('svg')).map((svg, i) => ({
      index: i,
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'),
      outerHTML: svg.outerHTML.substring(0, 500),
    }));
  });
  
  for (const svg of svgs) {
    console.log(`SVG[${svg.index}]: ${svg.width}x${svg.height} viewBox=${svg.viewBox}`);
    console.log('  Preview:', svg.outerHTML.substring(0, 200));
    console.log('');
  }

  // Take a screenshot
  await page.screenshot({ path: '/Users/jasonlh/Desktop/KIRO/welcome-page-screenshot.png', fullPage: true });
  console.log('Screenshot saved.');

  await browser.close();
})();
