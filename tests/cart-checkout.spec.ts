import { test, expect } from '@playwright/test';

/**
 * Checkout here doesn't go through a payment gateway — the Order model shows
 * a manual verification flow (Received -> Verifying -> Confirmed -> Payment
 * Done -> Packed -> Dispatched). So "checkout" just needs to correctly
 * capture customerName / customerPhone / customerAddress and create an
 * Order + OrderItem row(s), then show the customer their publicOrderId.
 */

test.describe('Cart and checkout', () => {
  test('add to cart updates cart count and running total', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').first().click();

    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('cart quantity changes update the order total', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').first().click();

    await page.goto('/cart');
    const totalBefore = await page.locator('[data-testid="cart-total"]').innerText();

    await page.locator('[data-testid="qty-increase"]').first().click();
    await expect(page.locator('[data-testid="cart-total"]')).not.toHaveText(totalBefore);
  });

  test('checkout requires name, phone, and address', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/checkout');

    // Submit empty to confirm validation catches missing required fields
    await page.locator('[data-testid="place-order"]').click();
    await expect(page.locator('[data-testid="checkout-error"]')).toBeVisible();
  });

  test('a complete checkout creates an order and shows a public order id', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/checkout');

    await page.locator('[data-testid="customer-name"]').fill('Test Customer');
    await page.locator('[data-testid="customer-phone"]').fill('9999999999');
    await page.locator('[data-testid="customer-address"]').fill('12 Test Street, Sivakasi, TN');
    await page.locator('[data-testid="place-order"]').click();

    // Order.publicOrderId should be shown as confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="public-order-id"]')).not.toBeEmpty();
  });
});
