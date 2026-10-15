import { test, expect } from '@playwright/test';

test.describe('Website Improvement & Feature Verification', () => {
  test('1. Homepage redesign and visual identity match specification', async ({ page }) => {
    await page.goto('/');

    // Hero carousel headings
    await expect(page.getByRole('heading', { name: /LIGHT UP YOUR CELEBRATION/i })).toBeVisible();

    // Verify Diwali countdown calendar is present and running
    await expect(page.getByText('DIWALI COUNTDOWN')).toBeVisible();
    await expect(page.getByText('November 8, 2026 (IST)')).toBeVisible();
    await expect(page.getByText('Days')).toBeVisible();
    await expect(page.getByText('Hours')).toBeVisible();
    await expect(page.getByText('Minutes')).toBeVisible();
    await expect(page.getByText('Seconds')).toBeVisible();

    // Verify hero restrictions: NO "Start Shopping" button inside the hero banner
    const heroSection = page.locator('div:has-text("LIGHT UP YOUR CELEBRATION")').first();
    await expect(heroSection.getByRole('button', { name: /Start Shopping/i })).toHaveCount(0);
    await expect(heroSection.getByRole('link', { name: /Start Shopping/i })).toHaveCount(0);

    // Primary shopping destinations below hero
    await expect(page.getByRole('link', { name: /Explore Crackers/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Shop Combos/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Quick Order List/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Track Order/i }).first()).toBeVisible();

    // 4 Trust badges
    await expect(page.getByText('Original Sivakasi Products')).toBeVisible();
    await expect(page.getByText('Quality Verified')).toBeVisible();
    await expect(page.getByText('Safe Delivery')).toBeVisible();
    await expect(page.getByText('Support & Assistance')).toBeVisible();

    // Traditional Showcase section ("Celebrate with Sivakasi")
    await expect(page.getByText('CELEBRATE WITH SIVAKASI')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Heritage Fireworks Direct from the Heartland/i })).toBeVisible();

    // Tamil Nadu statewide delivery celebration map
    await expect(page.getByText('From Sivakasi to Every Corner of Tamil Nadu')).toBeVisible();
    await expect(page.getByText(/Lighting up Tamil Nadu with authentic Sivakasi crackers/i)).toBeVisible();
  });

  test('2. Quick Order introductory section is removed and shopping starts directly', async ({ page }) => {
    await page.goto('/quick-order');

    // Verify marked green sections are NOT present on desktop or mobile
    await expect(page.locator('text="WHOLESALE PRICE LIST & QUICK ORDER"')).toHaveCount(0);
    await expect(page.locator('text="Sivakasi Direct Quick Order Sheet"')).toHaveCount(0);
    await expect(page.locator('text="Minimum Order Notice"')).toHaveCount(0);

    // Direct shopping controls are immediately available
    await expect(page.locator('input[placeholder*="Search crackers"]')).toBeVisible();
    await expect(page.locator('th:has-text("Products")')).toBeVisible();
    await expect(page.locator('th:has-text("Qty")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();

    // Discount messaging reflects "UP TO 70% DISCOUNT"
    await expect(page.locator('text=/UP TO 70% DISCOUNT/').first()).toBeVisible();
  });

  test('3. Persistent navigation and sticky navbar behavior', async ({ page, isMobile }) => {
    await page.goto('/');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    if (!isMobile) {
      // Desktop navbar navigation items
      await expect(page.locator('header a:has-text("Quick Order")')).toBeVisible();
      await expect(page.locator('header a:has-text("Explore Crackers")')).toBeVisible();
      await expect(page.locator('header a:has-text("Ready Packages")')).toBeVisible();
      await expect(page.locator('header a:has-text("Track Order")')).toBeVisible();
    } else {
      // Mobile hamburger drawer navigation
      const menuButton = page.locator('header button[aria-label="Open Navigation Menu"]');
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await expect(page.locator('a:has-text("Quick Order List"):visible').first()).toBeVisible();
      await expect(page.locator('a:has-text("Explore Crackers"):visible').first()).toBeVisible();
      await page.locator('button[aria-label="Close Menu"]').click();
    }

    // Scroll down and verify header remains visible (sticky)
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(header).toBeInViewport();
  });

  test('4. Promotional discount messaging and pricing consistency', async ({ page }) => {
    await page.goto('/');

    // Top ticker displays discount on eligible crackers
    await expect(page.locator('text=UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS').first()).toBeVisible();

    // Product cards show discount percentage or rate
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    await expect(firstProductCard).toBeVisible({ timeout: 15000 });
    await expect(firstProductCard.locator('text=/UP TO 70% OFF|% OFF/')).toBeVisible();
  });

  test('5. Delivery information transparency: no free delivery, delivery charges apply', async ({ page }) => {
    // Check shipping policy page
    await page.goto('/shipping-policy');
    await expect(page.getByText(/Delivery is available across Tamil Nadu. Delivery charges apply/i)).toBeVisible();
    await expect(page.getByText(/There is no free delivery/i)).toBeVisible();

    // Check checkout page order summary
    await page.goto('/');
    const productCard = page.locator('[data-testid="product-card"]').first();
    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.click();
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/checkout');

    await expect(page.locator('text=Delivery Charges:').first()).toBeVisible();
    await expect(page.locator('text=There is no free delivery').first()).toBeVisible();
  });
});
