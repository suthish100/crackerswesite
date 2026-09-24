import { test, expect } from '@playwright/test';

test.describe('Quick Order Price List', () => {
  test('quick order page renders products with amount calculation and subtotal', async ({ page }) => {
    await page.goto('/quick-order');

    // Page heading and minimum order notice
    await expect(page.getByRole('heading', { name: /Quick Order/i })).toBeVisible();
    await expect(page.locator('text=Minimum Order Notice')).toBeVisible();

    // Table headers exist
    await expect(page.locator('th:has-text("Image")')).toBeVisible();
    await expect(page.locator('th:has-text("Products")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Qty")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();

    // Input quantity on the first product
    const firstQtyInput = page.locator('input[type="number"]').first();
    await expect(firstQtyInput).toBeVisible();

    await firstQtyInput.fill('5');

    // Sticky grand total should reflect the update
    const grandTotal = page.locator('text=Grand Total :');
    await expect(grandTotal).toBeVisible();

    // Verify all 5 table headers are within viewport
    const amountHeader = page.locator('th:has-text("Amount")');
    await expect(amountHeader).toBeInViewport();

    // Click "View Bag" to open the Cart Drawer
    const viewBagBtn = page.getByRole('button', { name: /View Bag/i });
    await expect(viewBagBtn).toBeVisible();
    await viewBagBtn.click();

    // Verify Cart Drawer header and Total Amount are visible and within viewport
    const basketHeading = page.getByRole('heading', { name: 'Your Basket' });
    await expect(basketHeading).toBeVisible();
    const cartTotal = page.locator('[data-testid="cart-total"]');
    await expect(cartTotal).toBeVisible();
    await expect(cartTotal).toBeInViewport();

    // Close the cart drawer
    await page.getByRole('button', { name: '✕' }).click();
    await expect(basketHeading).not.toBeVisible();

    // Submit button links to checkout
    const submitBtn = page.locator('a:has-text("Submit Order Now")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await expect(page).toHaveURL(/\/checkout/);
  });
});
