import { test, expect } from '@playwright/test';

test.describe('AI Shopping Assistant & RAG Knowledge Base', () => {
  test('floating AI trigger button is visible and opens chat panel', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('[data-testid="ai-assistant-trigger"]');
    await expect(trigger).toBeVisible();

    // Click trigger to open panel
    await trigger.click();

    const panel = page.locator('[data-testid="ai-assistant-panel"]');
    await expect(panel).toBeVisible();

    // Verify header title
    await expect(panel.getByText('Sivakasi Shopping Assistant')).toBeVisible();
    await expect(panel.getByText('Online • Live Store AI')).toBeVisible();

    // Verify welcome message and suggestions
    await expect(panel.getByText("Hi! 👋 I'm your crackers shopping assistant")).toBeVisible();
    await expect(panel.getByRole('button', { name: /Show me crackers under ₹500/i })).toBeVisible();
    await expect(panel.getByRole('button', { name: /I have a ₹2,000 budget/i })).toBeVisible();
  });

  test('clicking a suggested question sends message and renders AI response with product cards', async ({ page }) => {
    await page.goto('/');

    // Open chat
    await page.locator('[data-testid="ai-assistant-trigger"]').click();
    const panel = page.locator('[data-testid="ai-assistant-panel"]');
    await expect(panel).toBeVisible();

    // Click suggested budget question
    const budgetBtn = panel.getByRole('button', { name: /I have a ₹2,000 budget/i });
    await budgetBtn.click();

    // Wait for response bubble
    await expect(panel.getByText(/Festive Package for ₹2,000 Budget/i)).toBeVisible({ timeout: 20000 });

    // Verify live product cards appear inside chat
    const productCards = panel.locator('[data-testid="ai-product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify product card has valid price and add-to-cart button
    await expect(productCards.first().locator('text=₹').first()).toBeVisible();
    const addBtn = productCards.first().locator('[data-testid="ai-add-to-cart"]');
    await expect(addBtn).toBeVisible();
  });

  test('adding to cart from AI product card updates the website shopping bag', async ({ page }) => {
    await page.goto('/');

    // Open chat
    await page.locator('[data-testid="ai-assistant-trigger"]').click();
    const panel = page.locator('[data-testid="ai-assistant-panel"]');

    // Ask for crackers under 500
    const input = panel.getByPlaceholder('Ask about crackers, budget, delivery...');
    await input.fill('Show me crackers under 500');
    await panel.getByRole('button', { name: /Send/i }).click();

    // Wait for product cards to load
    const firstProductCard = panel.locator('[data-testid="ai-product-card"]').first();
    await expect(firstProductCard).toBeVisible({ timeout: 20000 });

    // Click add to cart on the first card
    const addBtn = firstProductCard.locator('[data-testid="ai-add-to-cart"]');
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();

    // Verify button shows "Added ✓" feedback
    await expect(firstProductCard.getByText('Added ✓')).toBeVisible();

    // Verify navbar cart count reflects the item added
    const cartCount = page.locator('[data-testid="cart-count"]');
    await expect(cartCount).toBeVisible();
    const countText = await cartCount.innerText();
    expect(parseInt(countText, 10)).toBeGreaterThan(0);
  });

  test('answers business transport and delivery policy questions from RAG knowledge base', async ({ page }) => {
    await page.goto('/');

    // Open chat
    await page.locator('[data-testid="ai-assistant-trigger"]').click();
    const panel = page.locator('[data-testid="ai-assistant-panel"]');

    // Type policy question
    const input = panel.getByPlaceholder('Ask about crackers, budget, delivery...');
    await input.fill('What is your minimum order and how does road transport delivery work?');
    await panel.getByRole('button', { name: /Send/i }).click();

    // Verify RAG answers appear with key policy facts (e.g. ₹3,000 for TN/PY, Godown pickup, road transport)
    await expect(panel.getByText(/Sivakasi Transport & Delivery Details/i)).toBeVisible({ timeout: 20000 });
    await expect(panel.getByText(/Tamil Nadu & Pondicherry/i)).toBeVisible();
  });

  test('clear chat resets conversation and close button hides panel', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('[data-testid="ai-assistant-trigger"]');
    await trigger.click();
    const panel = page.locator('[data-testid="ai-assistant-panel"]');
    await expect(panel).toBeVisible();

    // Send a message
    const input = panel.getByPlaceholder('Ask about crackers, budget, delivery...');
    await input.fill('Hello AI');
    await panel.getByRole('button', { name: /Send/i }).click();

    await expect(panel.getByText('Hello AI')).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('text=Finding best crackers')).not.toBeVisible({ timeout: 20000 });

    // Click clear chat
    const clearBtn = panel.locator('button[aria-label="Clear chat conversation"]');
    await clearBtn.click();

    // Verify user message cleared, only welcome message remains
    await expect(panel.getByText('Hello AI')).not.toBeVisible();
    await expect(panel.getByText("Hi! 👋 I'm your crackers shopping assistant")).toBeVisible();

    // Click close
    const closeBtn = panel.locator('button[aria-label="Close assistant"]');
    await closeBtn.click();

    await expect(panel).not.toBeVisible();
  });
});
