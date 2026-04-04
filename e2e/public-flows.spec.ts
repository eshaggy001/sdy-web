import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForContent(page: Page) {
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// 1. Public navigation — every non-admin route renders
// ---------------------------------------------------------------------------

test.describe('Public navigation', () => {
  test('home renders hero and a programs section', async ({ page }) => {
    await page.goto('/mn');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/хөтөлбөр|programs/i).first()).toBeVisible();
  });

  test('about renders', async ({ page }) => {
    await page.goto('/mn/about');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('ideology renders', async ({ page }) => {
    await page.goto('/mn/ideology');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('programs list renders', async ({ page }) => {
    await page.goto('/mn/programs');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
    const cards = page.locator('.card-shadow');
    const emptyState = page.getByText(/олдсонгүй|no programs/i);
    await expect(cards.first().or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('news list renders', async ({ page }) => {
    await page.goto('/mn/news');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
    const newsItem = page.locator('article, [class*="card"], a[href*="/news/"]').first();
    const emptyState = page.getByText(/олдсонгүй|no news/i);
    await expect(newsItem.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('polls list renders', async ({ page }) => {
    await page.goto('/mn/polls');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('join page step 1 renders', async ({ page }) => {
    await page.goto('/mn/join');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByPlaceholder('Овог')).toBeVisible();
    await expect(page.getByPlaceholder('Нэр')).toBeVisible();
  });

  test('contact form renders', async ({ page }) => {
    await page.goto('/mn/contact');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByPlaceholder('Таны нэр')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Language switcher
// ---------------------------------------------------------------------------

test.describe('Language switcher', () => {
  test('mn → en via navbar toggle', async ({ page }) => {
    await page.goto('/mn');
    await waitForContent(page);

    await page.getByRole('button', { name: /^EN$/ }).first().click();

    await page.waitForURL(/\/en(\/|$)/);
    await page.waitForFunction(() => localStorage.getItem('sdy_lang') === 'en');
  });

  test('en → mn via navbar toggle', async ({ page }) => {
    await page.goto('/en');
    await waitForContent(page);

    await page.getByRole('button', { name: /^MN$/ }).first().click();

    await page.waitForURL(/\/mn(\/|$)/);
    await page.waitForFunction(() => localStorage.getItem('sdy_lang') === 'mn');
  });

  test('direct /en/contact shows English content', async ({ page }) => {
    await page.goto('/en/contact');
    await waitForContent(page);
    // "How can we help?" is the EN subject placeholder
    await expect(page.getByPlaceholder('How can we help?')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Content detail navigation
// ---------------------------------------------------------------------------

test.describe('Content detail navigation', () => {
  test('open first news detail', async ({ page }) => {
    await page.goto('/mn/news');
    await waitForContent(page);

    const detailLink = page.locator('a[href*="/news/"]').filter({
      hasNot: page.locator('[href$="/news"]'),
    }).first();

    if (!(await detailLink.isVisible().catch(() => false))) {
      test.info().annotations.push({ type: 'skip', description: 'No news items to open' });
      return;
    }

    await detailLink.click();
    await waitForContent(page);
    await expect(page).toHaveURL(/\/mn\/news\/[^/]+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('open first program detail', async ({ page }) => {
    await page.goto('/mn/programs');
    await waitForContent(page);

    const detailLink = page.locator('a[href*="/programs/"]').filter({
      hasNot: page.locator('[href$="/programs"]'),
    }).first();

    if (!(await detailLink.isVisible().catch(() => false))) {
      test.info().annotations.push({ type: 'skip', description: 'No programs to open' });
      return;
    }

    await detailLink.click();
    await waitForContent(page);
    await expect(page).toHaveURL(/\/mn\/programs\/[^/]+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Polls interaction
// ---------------------------------------------------------------------------

test.describe('Polls interaction', () => {
  test('cast a vote on an active poll (if any)', async ({ page }) => {
    await page.goto('/mn/polls');
    await waitForContent(page);

    const optionButton = page.locator('button').filter({ hasText: /^0[1-9]/ }).first();
    if (!(await optionButton.isVisible().catch(() => false))) {
      console.log('No active poll — skipping vote assertion');
      return;
    }

    await optionButton.click();
    await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Join form — submit intercepted
// ---------------------------------------------------------------------------

test.describe('Join form (intercepted)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/member_applications*', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: '[]',
      })
    );
  });

  test('complete two-step join flow reaches success state', async ({ page }) => {
    await page.goto('/mn/join');
    await waitForContent(page);

    // Step 1
    await page.getByPlaceholder('Овог').fill('Тест');
    await page.getByPlaceholder('Нэр').fill('Хэрэглэгч');
    await page.getByPlaceholder('your@email.com').fill(`test+${Date.now()}@example.com`);
    await page.getByPlaceholder('Таны нас').fill('25');
    await page.getByRole('button', { name: /Дараагийн алхам/ }).click();

    // Step 2
    const locationSelect = page.locator('select').first();
    await expect(locationSelect).toBeVisible();
    await locationSelect.selectOption('Улаанбаатар');

    await page.getByPlaceholder('+976 XXXX XXXX').fill('+976 9999 9999');
    await page.locator('input[type="checkbox"]').check();

    await page.getByRole('button', { name: /Бүртгэл дуусгах/ }).click();

    // Step 3 — success
    await expect(page.getByText(/SDY-д тавтай морил/)).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 6. Contact form — submit intercepted
// ---------------------------------------------------------------------------

test.describe('Contact form (intercepted)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/contact_messages*', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: '[]',
      })
    );
  });

  test('submit contact form shows success', async ({ page }) => {
    await page.goto('/mn/contact');
    await waitForContent(page);

    await page.getByPlaceholder('Таны нэр').fill('Тест Хэрэглэгч');
    await page.getByPlaceholder('your@email.com').fill(`test+${Date.now()}@example.com`);
    await page.getByPlaceholder('Бид танд юугаар туслах вэ?').fill('Тест гарчиг');
    await page.getByPlaceholder('Таны зурвас энд...').fill('Энэ бол тест зурвас.');

    await page.getByRole('button', { name: /Зурвас илгээх/ }).click();

    await expect(page.getByText(/Зурвас амжилттай илгээгдлээ/)).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Mobile menu
// ---------------------------------------------------------------------------

test.describe('Mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('open drawer and navigate to About', async ({ page }) => {
    await page.goto('/mn');
    await waitForContent(page);

    await page.getByRole('button', { name: 'Toggle menu' }).click();

    // The desktop nav also contains an /mn/about link but is hidden at this
    // viewport — use :visible to pick the drawer link.
    const aboutLink = page.locator('a[href="/mn/about"]:visible').first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/mn\/about$/);
  });
});

// ---------------------------------------------------------------------------
// 8. No page errors across public routes
// ---------------------------------------------------------------------------

test.describe('No errors on public routes', () => {
  test('no console errors or page errors while browsing', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const routes = [
      '/mn',
      '/mn/about',
      '/mn/ideology',
      '/mn/programs',
      '/mn/news',
      '/mn/polls',
      '/mn/join',
      '/mn/contact',
    ];

    for (const route of routes) {
      await page.goto(route);
      await waitForContent(page);
    }

    // Filter out expected noise (favicon 404s, third-party dev-tool warnings)
    const meaningfulConsole = consoleErrors.filter(
      (e) =>
        !/favicon|devtools|Extension|ResizeObserver loop/i.test(e)
    );

    expect(pageErrors, `Page errors: ${pageErrors.join('\n')}`).toEqual([]);
    expect(meaningfulConsole, `Console errors: ${meaningfulConsole.join('\n')}`).toEqual([]);
  });
});
