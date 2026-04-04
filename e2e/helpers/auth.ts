import { type Page, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export function hasAdminCredentials(): boolean {
  return ADMIN_EMAIL.length > 0 && ADMIN_PASSWORD.length > 0;
}

/**
 * Sign in to the admin panel. Assumes a clean page state.
 * Waits until the dashboard heading is visible.
 */
export async function adminLogin(page: Page) {
  if (!hasAdminCredentials()) {
    throw new Error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars. ' +
      'Set them before running admin tests:\n' +
      '  ADMIN_EMAIL=x ADMIN_PASSWORD=y npm run test:e2e'
    );
  }

  await page.goto('/mn/admin/login');
  await page.getByPlaceholder('admin@sdy.mn').fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]')).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in|нэвтрэх/i }).click();

  // Wait for redirect to admin dashboard
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
  // Wait for auth loading to finish — dashboard content should appear
  await page.waitForSelector('text=/Dashboard|Хянах самбар/i', { timeout: 15_000 });
}
