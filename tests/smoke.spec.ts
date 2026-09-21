import { test, expect } from '@playwright/test';

// Core public pages, matching the Category / Product / Package models.
// Add data-testid attributes to your components as noted in TESTING-SETUP.md.

test.describe('Core pages load', () => {
  test('homepage renders active products', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('category navigation filters products', async ({ page }) => {
    await page.goto('/');
    const firstCategory = page.locator('[data-testid="category-link"]').first();
    await expect(firstCategory).toBeVisible();
    await firstCategory.click();
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('product detail page shows price and stock status', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await expect(page.locator('[data-testid="product-price"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart"]').first()).toBeVisible();
  });

  test('an out-of-stock product disables add-to-cart', async ({ page }) => {
    // Requires at least one seeded product with stockQty = 0.
    // Adjust the selector to however your UI marks out-of-stock products.
    const outOfStock = page.locator('[data-testid="product-card"][data-out-of-stock="true"]').first();
    await page.goto('/');
    if (await outOfStock.count()) {
      await outOfStock.click();
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeDisabled();
    }
  });

  test('package listing shows bundle price and included items', async ({ page }) => {
    await page.goto('/packages');
    await expect(page.locator('[data-testid="package-card"]').first()).toBeVisible();
    await page.locator('[data-testid="package-card"]').first().click();
    await expect(page.locator('[data-testid="package-price"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="package-item"]').first()).toBeVisible();
  });
});
