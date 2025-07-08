const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to admin dashboard...');
  await page.goto('http://localhost:3000/admin/dashboard/newtest');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Check page content
  const title = await page.title();
  console.log('Page title:', title);
  
  // Look for admin components
  const hasLoading = await page.locator('text=Loading').count();
  const hasLogin = await page.locator('text=Login with GitHub').count();
  const hasDashboard = await page.locator('text=Hello from').count();
  
  console.log('Loading elements:', hasLoading);
  console.log('Login elements:', hasLogin);
  console.log('Dashboard elements:', hasDashboard);
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log('\nPage content preview:', bodyText.substring(0, 500));
  
  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  
  await page.waitForTimeout(3000);
  
  await browser.close();
})();