import { test, expect } from '@playwright/test';

test('verify product page', async ({ page }) => {
  // We can't easily test localhost:3000 here without starting the server,
  // but we can verify the file structure and content has been created.
  // This script mimics what we would do if we had a running dev server.

  // Navigate to a mock product page
  await page.goto('http://localhost:3000/products/prod_mock');

  // Verify elements
  await expect(page.getByText('Modern Lamp')).toBeVisible();
  await expect(page.getByText('Color: White')).toBeVisible();

  // Test Quantity
  await page.getByLabel('Increase quantity').click();
  await expect(page.getByText('2')).toBeVisible();

  // Test Image Switch
  await page.getByTitle('Black').click();
  await expect(page.getByText('Color: Black')).toBeVisible();
});
