const puppeteer = require('puppeteer');
const fs = require('fs');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Navigate to the sample pages
  console.log('Capturing home page (empty session)...');
  await page.goto('http://localhost:8030/#/sample-pages', { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(4000);

  // Take screenshot of home page
  await page.screenshot({ path: '/Users/jasonlh/Desktop/KIRO/home-page.png', fullPage: false });
  console.log('Home page screenshot saved.');

  // Click on the sidebar to expand it
  console.log('Expanding sidebar...');
  await page.evaluate(() => {
    // Click the sidebar area (48px rail) to expand
    const sidebar = document.querySelector('[style*="width: 48px"]') || document.querySelector('[style*="width:48px"]');
    if (sidebar) sidebar.click();
  });
  await delay(1000);

  // Now find and click Latency Spike Investigation
  console.log('Clicking Latency Spike Investigation...');
  const clicked = await page.evaluate(() => {
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      if (div.textContent.includes('Latency Spike') && div.children.length < 5) {
        const parent = div.closest('[style*="cursor"]');
        if (parent) { parent.click(); return 'clicked parent'; }
        div.click();
        return 'clicked div';
      }
    }
    return 'not found';
  });
  console.log('Click result:', clicked);
  await delay(3000);

  // Take screenshot of dashboard
  await page.screenshot({ path: '/Users/jasonlh/Desktop/KIRO/dashboard-page.png', fullPage: false });
  console.log('Dashboard page screenshot saved.');

  // Build the export HTML with embedded base64 images
  const homeImg = fs.readFileSync('/Users/jasonlh/Desktop/KIRO/home-page.png').toString('base64');
  const dashImg = fs.readFileSync('/Users/jasonlh/Desktop/KIRO/dashboard-page.png').toString('base64');

  const outputHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpenSearch Observability — Sample Pages Export</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
body { margin: 0; font-family: 'Outfit', sans-serif; background: #060D1A; color: #D8E4F0; }
.page-section { margin-bottom: 60px; }
.page-section h2 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 500; color: #fff; padding: 0 0 16px; }
.page-section img { width: 100%; display: block; border: 1px solid #1E2E50; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.container { max-width: 1500px; margin: 0 auto; padding: 40px 32px; }
h1 { font-family: 'Space Grotesk', sans-serif; font-size: 32px; margin-bottom: 8px; color: #fff; }
.subtitle { color: #6B7F9E; margin-bottom: 48px; font-size: 16px; }
</style>
</head>
<body>
<div class="container">
  <h1>OpenSearch Observability — UI Prototype</h1>
  <p class="subtitle">Session-based navigation with AI-powered investigation flows</p>
  
  <div class="page-section">
    <h2>1. Home — Empty Session Page</h2>
    <img src="data:image/png;base64,${homeImg}" alt="Home page - empty session with input" />
  </div>
  
  <div class="page-section">
    <h2>2. Dashboard — Latency Spike Investigation</h2>
    <img src="data:image/png;base64,${dashImg}" alt="Latency Spike Investigation session" />
  </div>
</div>
</body>
</html>`;

  fs.writeFileSync('/Users/jasonlh/Desktop/KIRO/sample-pages-export.html', outputHtml);
  console.log('\\nExport saved to: /Users/jasonlh/Desktop/KIRO/sample-pages-export.html');
  console.log('(Self-contained HTML with embedded screenshots)');

  await browser.close();
})();
