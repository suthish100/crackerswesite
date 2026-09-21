import { test, expect } from '@playwright/test';

/**
 * Requires an AdminUser to exist (create one via your seed.ts, or a
 * dedicated test-seed script). Pass its credentials as CI secrets —
 * never hardcode a real admin password here.
 */
const ADMIN_PHONE = process.env.TEST_ADMIN_PHONE || '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';

test.describe('Admin order management', () => {
  test.skip(!ADMIN_PHONE || !ADMIN_PASSWORD, 'TEST_ADMIN_PHONE / TEST_ADMIN_PASSWORD not set');

  test('admin can log in with phone and password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('[data-testid="admin-phone"]').fill(ADMIN_PHONE);
    await page.locator('[data-testid="admin-password"]').fill(ADMIN_PASSWORD);
    await page.locator('[data-testid="admin-login-submit"]').click();

    await expect(page).toHaveURL(/\/admin(\/dashboard)?/);
  });

  test('admin can see the order queue and update a status', async ({ page, request }) => {
    await page.goto('/admin/login');
    await page.locator('[data-testid="admin-phone"]').fill(ADMIN_PHONE);
    await page.locator('[data-testid="admin-password"]').fill(ADMIN_PASSWORD);
    await page.locator('[data-testid="admin-login-submit"]').click();

    const orderResponse = await request.post('/api/orders', {
      data: {
        customerName: 'Admin Test Customer',
        customerPhone: '9999999999',
        customerAddress: 'Admin test address',
        items: [{ productId: 1, quantity: 1 }],
      },
    });
    const orderData = await orderResponse.json();

    await page.goto('/admin/orders');
    const firstOrder = page.locator('[data-testid="order-row"]').filter({ hasText: orderData.order.publicOrderId });
    await expect(firstOrder).toBeVisible();

    await firstOrder.getByRole('button', { name: /Manage Order/ }).click();
    await page.locator('[data-testid="order-status-select"]').selectOption('Verifying');
    await page.getByRole('button', { name: /Apply Status Change/ }).click();
    await expect(firstOrder.locator('[data-testid="order-status-badge"]')).toHaveText('Verifying');
  });
});
