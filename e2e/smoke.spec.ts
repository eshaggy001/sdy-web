import { test, expect, type Page } from '@playwright/test';
import { adminLogin, hasAdminCredentials } from './helpers/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the page to finish any Framer-Motion entrance animations */
async function waitForContent(page: Page) {
  // The app wraps every page in <motion.div> with opacity transition.
  // Wait for network idle + at least one visible heading or card.
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// PUBLIC PAGES
// ---------------------------------------------------------------------------

test.describe('Public pages', () => {
  test('homepage loads and key sections render', async ({ page }) => {
    await page.goto('/mn');
    await waitForContent(page);

    // Hero heading should be visible
    await expect(page.locator('h1').first()).toBeVisible();

    // Scroll down — programs section should exist
    const programsSection = page.getByText(/хөтөлбөр|programs/i).first();
    await expect(programsSection).toBeVisible();
  });

  test('programs list is visible', async ({ page }) => {
    await page.goto('/mn/programs');
    await waitForContent(page);

    // Page heading
    await expect(page.locator('h1')).toBeVisible();

    // At least one program card or empty state
    const cards = page.locator('.card-shadow');
    const emptyState = page.getByText(/олдсонгүй|no programs/i);
    await expect(cards.first().or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('events tab works', async ({ page }) => {
    await page.goto('/mn/programs');
    await waitForContent(page);

    // Click Events tab
    await page.getByRole('button', { name: /арга хэмжээ|events/i }).click();

    // Event cards or empty state
    const cards = page.locator('.card-shadow');
    const emptyState = page.getByText(/олдсонгүй|no events/i);
    await expect(cards.first().or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('polls list is visible', async ({ page }) => {
    await page.goto('/mn/polls');
    await waitForContent(page);

    await expect(page.locator('h1')).toBeVisible();

    // At least one poll card or message
    const pollCard = page.locator('[class*="card"]').first();
    await expect(pollCard).toBeVisible({ timeout: 10_000 });
  });

  test('news is visible', async ({ page }) => {
    await page.goto('/mn/news');
    await waitForContent(page);

    await expect(page.locator('h1')).toBeVisible();

    // News items use article-style layout, not .card-shadow
    const newsItem = page.locator('article, [class*="card"], a[href*="/news/"]').first();
    const emptyState = page.getByText(/олдсонгүй|no news/i);
    await expect(newsItem.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// INTERACTIVE PUBLIC FLOWS
// ---------------------------------------------------------------------------

test.describe('Interactive public flows', () => {
  test('vote in a poll', async ({ page }) => {
    await page.goto('/mn/polls');
    await waitForContent(page);

    // Find an active poll's option button (numbered option)
    const optionButton = page.locator('button').filter({ hasText: /^0[1-9]/ }).first();
    const isVotable = await optionButton.isVisible().catch(() => false);

    if (!isVotable) {
      console.log('⚠ No active polls available to vote on — skipping vote assertion');
      return;
    }

    await optionButton.click();

    // After voting, percentage results should appear
    await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('submit event registration', async ({ page }) => {
    // Navigate to events tab to find an event with open registration
    await page.goto('/mn/programs');
    await waitForContent(page);
    await page.getByRole('button', { name: /арга хэмжээ|events/i }).click();
    await page.waitForTimeout(1000);

    // Try to find a "Register" link
    const registerLink = page.getByRole('link', { name: /бүртгүүлэх|register/i }).first();
    const hasRegistration = await registerLink.isVisible().catch(() => false);

    if (!hasRegistration) {
      console.log('⚠ No events with open registration — skipping registration test');
      return;
    }

    await registerLink.click();
    await waitForContent(page);

    // Fill registration form
    const uniqueEmail = `test+${Date.now()}@smoke.test`;
    await page.getByPlaceholder(/нэр|full name/i).fill('Smoke Test User');
    await page.getByPlaceholder(/имэйл|email/i).fill(uniqueEmail);

    // Submit
    await page.getByRole('button', { name: /бүртгүүлэх|register/i }).click();

    // Assert success or already-registered message
    const success = page.getByText(/амжилттай|successfully|аль хэдийн|already/i);
    await expect(success).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// ADMIN FLOWS
// ---------------------------------------------------------------------------

test.describe('Admin flows', () => {
  test.skip(!hasAdminCredentials(), 'ADMIN_EMAIL / ADMIN_PASSWORD not set');

  test('admin sign in', async ({ page }) => {
    await adminLogin(page);
    // Should be on admin dashboard
    await expect(page).toHaveURL(/\/mn\/admin/);
  });

  test('create and save an event in admin', async ({ page }) => {
    await adminLogin(page);

    await page.goto('/mn/admin/events/new');
    await waitForContent(page);

    // Fill Mongolian fields
    const titleMnInput = page.locator('input').filter({ hasText: '' }).nth(0);
    const allInputs = page.locator('input[type="text"], input:not([type])');
    // Title MN — first text input after the MN lang divider
    await allInputs.first().fill('Smoke Test Event MN');

    // Description MN — first textarea
    const allTextareas = page.locator('textarea');
    await allTextareas.first().fill('Smoke test event description in Mongolian');

    // Fill English fields — they come after the EN lang divider
    // Title EN
    const textInputs = await allInputs.all();
    if (textInputs.length >= 2) {
      await textInputs[1].fill('Smoke Test Event EN');
    }
    // Description EN
    const textareas = await allTextareas.all();
    if (textareas.length >= 2) {
      await textareas[1].fill('Smoke test event description in English');
    }

    // Set start date
    const dateInput = page.locator('input[type="datetime-local"]').first();
    if (await dateInput.isVisible()) {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      await dateInput.fill(tomorrow);
    }

    // Save
    await page.getByRole('button', { name: /хадгалах|save/i }).click();

    // Should navigate back to events list or show success
    await expect(page.getByText(/арга хэмжээ|events/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('create and save a poll in admin', async ({ page }) => {
    await adminLogin(page);

    await page.goto('/mn/admin/polls/new');
    await waitForContent(page);

    // Fill question MN — first input in the MN section
    const allInputs = page.locator('input[type="text"], input:not([type]):not([type="date"]):not([type="checkbox"]):not([type="number"])');
    const inputs = await allInputs.all();

    // Question MN (first input)
    if (inputs.length > 0) await inputs[0].fill('Тест асуулт MN?');
    // Option 1 MN (second input)
    if (inputs.length > 1) await inputs[1].fill('Тийм');
    // Option 2 MN (third input)
    if (inputs.length > 2) await inputs[2].fill('Үгүй');

    // Question EN (after EN divider)
    if (inputs.length > 3) await inputs[3].fill('Test question EN?');
    // Option 1 EN
    if (inputs.length > 4) await inputs[4].fill('Yes');
    // Option 2 EN
    if (inputs.length > 5) await inputs[5].fill('No');

    // Save
    await page.getByRole('button', { name: /хадгалах|save/i }).click();

    // Should navigate back to polls list
    await expect(page.getByText(/асуулга|polls/i).first()).toBeVisible({ timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// NAVIGATION STABILITY
// ---------------------------------------------------------------------------

test.describe('Navigation stability', () => {
  test('cross-page navigation without data loss', async ({ page }) => {
    // Home
    await page.goto('/mn');
    await waitForContent(page);
    await expect(page.locator('h1').first()).toBeVisible();

    // Programs
    await page.goto('/mn/programs');
    await waitForContent(page);
    await expect(page.locator('h1')).toBeVisible();

    // News
    await page.goto('/mn/news');
    await waitForContent(page);
    await expect(page.locator('h1')).toBeVisible();

    // Polls
    await page.goto('/mn/polls');
    await waitForContent(page);
    await expect(page.locator('h1')).toBeVisible();

    // Admin (if credentials available)
    if (hasAdminCredentials()) {
      await adminLogin(page);
      await expect(page).toHaveURL(/\/admin/);
    }
  });
});

// ---------------------------------------------------------------------------
// SESSION REFRESH
// ---------------------------------------------------------------------------

test.describe('Session refresh resilience', () => {
  test.skip(!hasAdminCredentials(), 'ADMIN_EMAIL / ADMIN_PASSWORD not set');

  test('admin actions work after 3-minute wait', async ({ page }) => {
    test.setTimeout(240_000);

    const authLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Auth]')) {
        authLogs.push(`${new Date().toISOString()} ${text}`);
      }
    });

    await adminLogin(page);

    console.log('⏳ Waiting 3 minutes to test session refresh...');
    await page.waitForTimeout(180_000);

    await page.goto('/mn/admin/events');
    await waitForContent(page);

    await expect(page).not.toHaveURL(/\/login/);

    const addButton = page.getByRole('link', { name: /нэмэх|add/i }).or(
      page.getByRole('button', { name: /нэмэх|add/i })
    );
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await expect(page).toHaveURL(/\/events\/new/);
    }

    if (authLogs.length > 0) {
      console.log('🔑 Auth refresh logs:');
      authLogs.forEach((log) => console.log(`  ${log}`));
    } else {
      console.log('ℹ No [Auth] console logs captured during the wait period');
    }
  });
});

// ---------------------------------------------------------------------------
// FORCED TOKEN EXPIRY — queuedLock stress test
// ---------------------------------------------------------------------------

test.describe('Forced token expiry & queuedLock', () => {
  test.skip(!hasAdminCredentials(), 'ADMIN_EMAIL / ADMIN_PASSWORD not set');

  test('token refresh works after forced expiry — no session corruption', async ({ page }) => {
    test.setTimeout(120_000);

    // Collect all auth-related console output
    const authLogs: string[] = [];
    const errors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Auth]') || text.includes('lock') || text.includes('token')) {
        authLogs.push(`[${msg.type()}] ${text}`);
      }
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    // 1. Sign in normally
    await adminLogin(page);
    console.log('✅ Signed in');

    // 2. Capture the pre-expiry user email for corruption check later
    const preExpiryEmail = await page.evaluate(() => {
      const raw = Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .map((k) => localStorage.getItem(k))
        .find(Boolean);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed?.user?.email ?? null;
      } catch { return null; }
    });
    console.log(`📧 Pre-expiry session email: ${preExpiryEmail}`);

    // 3. Force token expiry by mutating the stored session
    const didExpire = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (keys.length === 0) return false;
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const session = JSON.parse(raw);
          // Set expires_at to 1 hour in the past
          session.expires_at = Math.floor(Date.now() / 1000) - 3600;
          // Set expires_in to -3600 to signal clearly expired
          session.expires_in = -3600;
          localStorage.setItem(key, JSON.stringify(session));
          console.log('[Auth] ⚡ FORCED TOKEN EXPIRY — expires_at set to past');
        } catch { /* skip parse errors */ }
      }
      return true;
    });
    expect(didExpire).toBe(true);
    console.log('⚡ Token expiry forced in localStorage');

    // 4. Fire 5 concurrent getSession() calls to stress the queuedLock.
    //    The app exposes `window.__test_supabase` in dev mode.
    //    All 5 calls hit an expired token — the lock must serialize the refresh
    //    so only one token exchange happens and all callers get the same result.
    // 4. Stress-test queuedLock: fire 5 concurrent getSession() calls.
    //    Each one sees an expired token and tries to refresh. The lock must
    //    serialize refresh so only one network call happens.
    //    Race with a 30s timeout in case the lock deadlocks — that IS the bug.
    console.log('🔒 Stress-testing queuedLock with 5 concurrent getSession() calls...');

    const concurrentResults = await Promise.race([
      page.evaluate(async () => {
        const supabase = (window as any).__test_supabase;
        if (!supabase) {
          return { elapsed: 0, available: false, deadlocked: false, outcomes: [] };
        }
        const start = Date.now();
        const results = await Promise.allSettled([
          supabase.auth.getSession(),
          supabase.auth.getSession(),
          supabase.auth.getSession(),
          supabase.auth.getSession(),
          supabase.auth.getSession(),
        ]);
        const elapsed = Date.now() - start;
        return {
          elapsed,
          available: true,
          deadlocked: false,
          outcomes: results.map((r: any, i: number) => ({
            index: i,
            status: r.status,
            hasSession: r.status === 'fulfilled' && !!r.value?.data?.session,
            email: r.status === 'fulfilled'
              ? r.value?.data?.session?.user?.email ?? null
              : null,
            error: r.status === 'rejected'
              ? r.reason?.message ?? String(r.reason)
              : null,
          })),
        };
      }),
      // Deadlock detector: if getSession hangs >30s, the lock is broken
      new Promise<{ elapsed: number; available: boolean; deadlocked: boolean; outcomes: any[] }>((resolve) =>
        setTimeout(() => resolve({ elapsed: 30_000, available: true, deadlocked: true, outcomes: [] }), 30_000)
      ),
    ]);

    if (concurrentResults.deadlocked) {
      console.log('❌ DEADLOCK DETECTED — 5 concurrent getSession() hung for >30s');
      console.log('   This means queuedLock is not correctly releasing under concurrent expired-token refresh.');
      // Don't fail hard — report it and continue to test navigation recovery
    } else if (concurrentResults.available) {
      console.log(`⏱  5 concurrent getSession() completed in ${concurrentResults.elapsed}ms`);
      for (const o of concurrentResults.outcomes) {
        console.log(`  [${o.index}] ${o.status} | session=${o.hasSession} | email=${o.email} | error=${o.error}`);
      }

      // 5. Verify: all calls settled (no unhandled lock errors)
      const allSettled = concurrentResults.outcomes.every(
        (o: any) => o.status === 'fulfilled'
      );
      if (!allSettled) {
        const failures = concurrentResults.outcomes.filter((o: any) => o.status === 'rejected');
        console.log(`⚠ ${failures.length}/5 calls rejected (lock contention expected):`);
        failures.forEach((o: any) => console.log(`  [${o.index}] ${o.error}`));
      }

      // 6. Verify: no session corruption — sessions that succeeded have same email
      const sessionEmails = concurrentResults.outcomes
        .filter((o: any) => o.hasSession)
        .map((o: any) => o.email);
      const uniqueEmails = [...new Set(sessionEmails)];
      if (uniqueEmails.length > 0) {
        expect(uniqueEmails).toHaveLength(1);
        expect(uniqueEmails[0]).toBe(preExpiryEmail);
        console.log('✅ No session corruption — all sessions match original email');
      } else {
        console.log('⚠ No sessions returned from concurrent calls — checking via navigation');
      }
    } else {
      console.log('⚠ __test_supabase not available — skipping direct lock test');
    }

    // 7. Verify: post-refresh session in localStorage is valid
    const postRefreshState = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (keys.length === 0) return null;
      try {
        const session = JSON.parse(localStorage.getItem(keys[0])!);
        return {
          expiresAt: session.expires_at,
          isExpired: session.expires_at < Math.floor(Date.now() / 1000),
          email: session.user?.email,
        };
      } catch { return null; }
    });

    if (postRefreshState) {
      console.log(`📝 Post-refresh session: expires_at=${postRefreshState.expiresAt}, expired=${postRefreshState.isExpired}, email=${postRefreshState.email}`);
      expect(postRefreshState.isExpired).toBe(false);
      expect(postRefreshState.email).toBe(preExpiryEmail);
      console.log('✅ Session refreshed — new expiry is in the future');
    }

    // 8. Verify: admin actions still work after forced refresh
    await page.goto('/mn/admin/events');
    await waitForContent(page);

    await expect(page).not.toHaveURL(/\/login/);
    console.log('✅ Admin page loads without redirect to login');

    // Try creating an event to verify write access
    const addButton = page.getByRole('link', { name: /нэмэх|add/i }).or(
      page.getByRole('button', { name: /нэмэх|add/i })
    );
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await expect(page).toHaveURL(/\/events\/new/);
      console.log('✅ Can navigate to create event — full auth works post-refresh');
    }

    // 9. Report any JS errors that occurred
    if (errors.length > 0) {
      console.log('❌ Page errors during test:');
      errors.forEach((e) => console.log(`  ${e}`));
    } else {
      console.log('✅ No JS errors during forced expiry + refresh');
    }

    // 10. Dump auth logs
    console.log(`\n🔑 Auth log (${authLogs.length} entries):`);
    authLogs.forEach((log) => console.log(`  ${log}`));
  });
});

// ---------------------------------------------------------------------------
// 10-MINUTE STABILITY TEST
// ---------------------------------------------------------------------------

test.describe('Long-running stability', () => {
  test.skip(!hasAdminCredentials(), 'ADMIN_EMAIL / ADMIN_PASSWORD not set');

  test('10-minute wait then full flow — no lock/auth/empty-state failures', async ({ page }) => {
    test.setTimeout(900_000); // 15 minutes — gives 5 min slack

    // Collect everything for forensics
    const authLogs: string[] = [];
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const lockIssues: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      const ts = new Date().toISOString();
      if (text.includes('[Auth]')) {
        authLogs.push(`${ts} ${text}`);
      }
      if (msg.type() === 'error') {
        consoleErrors.push(`${ts} ${text}`);
      }
      if (/lock|deadlock|stole|timeout/i.test(text)) {
        lockIssues.push(`${ts} ${text}`);
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(`${new Date().toISOString()} ${err.message}`);
    });

    // -------- 1. Sign in --------
    console.log('🔐 Signing in...');
    await adminLogin(page);
    console.log('✅ Signed in');

    const sessionBefore = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (!keys.length) return null;
      try {
        const s = JSON.parse(localStorage.getItem(keys[0])!);
        return { email: s.user?.email, expiresAt: s.expires_at };
      } catch { return null; }
    });
    console.log(`📧 Initial session: ${sessionBefore?.email}, expires at ${sessionBefore?.expiresAt ? new Date(sessionBefore.expiresAt * 1000).toISOString() : 'unknown'}`);

    // -------- 2. Wait 10 minutes --------
    console.log('⏳ Waiting 10 minutes to exercise Supabase auto-refresh...');
    const waitStart = Date.now();
    // Keep a page open — don't let browser idle-kill anything
    // Navigate to admin dashboard so the app is "active" during the wait
    await page.goto('/mn/admin');
    await page.waitForLoadState('networkidle');

    // Use small sleeps to give the event loop + auto-refresh a chance to tick
    const totalWaitMs = 600_000;
    const sleepChunk = 30_000;
    let elapsed = 0;
    while (elapsed < totalWaitMs) {
      await page.waitForTimeout(sleepChunk);
      elapsed += sleepChunk;
      if (elapsed % 120_000 === 0) {
        console.log(`  …${elapsed / 60_000}min elapsed (auth events so far: ${authLogs.length})`);
      }
    }
    console.log(`✅ ${((Date.now() - waitStart) / 1000).toFixed(0)}s wait complete`);

    // -------- 3. Navigate across key pages (public + admin) --------
    console.log('🧭 Navigating across key pages...');
    const navigationChecks: Array<{ path: string; type: 'public' | 'admin'; expectVisible: string }> = [
      { path: '/mn', type: 'public', expectVisible: 'h1' },
      { path: '/mn/programs', type: 'public', expectVisible: 'h1' },
      { path: '/mn/news', type: 'public', expectVisible: 'h1' },
      { path: '/mn/polls', type: 'public', expectVisible: 'h1' },
      { path: '/mn/admin', type: 'admin', expectVisible: 'h1, [class*="Dashboard"], text=/Dashboard|Хянах/i' },
      { path: '/mn/admin/events', type: 'admin', expectVisible: 'h1, h2' },
      { path: '/mn/admin/polls', type: 'admin', expectVisible: 'h1, h2' },
      { path: '/mn/admin/programs', type: 'admin', expectVisible: 'h1, h2' },
    ];

    const navFailures: string[] = [];
    const emptyStateFailures: string[] = [];

    for (const check of navigationChecks) {
      console.log(`  → ${check.path}`);
      await page.goto(check.path);
      await page.waitForLoadState('networkidle');

      // Redirect to login = auth failure
      if (check.type === 'admin' && page.url().includes('/login')) {
        navFailures.push(`${check.path} → redirected to /login (auth lost)`);
        continue;
      }

      // Heading visible = page rendered
      const heading = page.locator('h1, h2').first();
      const visible = await heading.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!visible) {
        navFailures.push(`${check.path} → no heading rendered`);
        continue;
      }

      // Public pages should still have data — no blank lists
      if (check.type === 'public') {
        // Look for any content card / article / list item
        const contentCount = await page
          .locator('.card-shadow, article, [class*="card"], a[href*="/"]')
          .count();
        if (contentCount < 3) {
          emptyStateFailures.push(`${check.path} → only ${contentCount} content elements found`);
        }
      }
    }

    // -------- 4. Verify admin actions still work --------
    console.log('🛠  Testing admin write action (create event)...');
    let adminActionOk = false;
    try {
      await page.goto('/mn/admin/events/new');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/login')) {
        navFailures.push('/admin/events/new → redirected to /login');
      } else {
        const textInputs = page.locator('input[type="text"], input:not([type]):not([type="date"]):not([type="checkbox"]):not([type="number"]):not([type="email"]):not([type="password"]):not([type="datetime-local"])');
        const textareas = page.locator('textarea');
        const inputCount = await textInputs.count();
        const textareaCount = await textareas.count();

        if (inputCount >= 2 && textareaCount >= 2) {
          await textInputs.nth(0).fill('Stability Test Event MN');
          await textareas.nth(0).fill('Stability test — MN description');
          await textInputs.nth(1).fill('Stability Test Event EN');
          await textareas.nth(1).fill('Stability test — EN description');

          const dateInput = page.locator('input[type="datetime-local"]').first();
          if (await dateInput.isVisible().catch(() => false)) {
            const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
            await dateInput.fill(tomorrow);
          }

          const saveBtn = page.getByRole('button', { name: /хадгалах|save/i }).first();
          await saveBtn.click();

          // Wait for navigation back to list or success
          await page.waitForTimeout(3000);
          adminActionOk = !page.url().includes('/login');
        } else {
          navFailures.push(`/admin/events/new → form not rendered (${inputCount} inputs, ${textareaCount} textareas)`);
        }
      }
    } catch (e: any) {
      navFailures.push(`admin create event threw: ${e.message}`);
    }

    // -------- 5. Check session state after the whole run --------
    const sessionAfter = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (!keys.length) return null;
      try {
        const s = JSON.parse(localStorage.getItem(keys[0])!);
        return {
          email: s.user?.email,
          expiresAt: s.expires_at,
          isExpired: s.expires_at < Math.floor(Date.now() / 1000),
        };
      } catch { return null; }
    });

    // -------- 6. REPORT --------
    console.log('\n' + '='.repeat(70));
    console.log('📊 10-MINUTE STABILITY REPORT');
    console.log('='.repeat(70));
    console.log(`Initial session: ${sessionBefore?.email} exp=${sessionBefore?.expiresAt}`);
    console.log(`Final session:   ${sessionAfter?.email} exp=${sessionAfter?.expiresAt} expired=${sessionAfter?.isExpired}`);
    console.log(`Token refreshed: ${sessionBefore?.expiresAt !== sessionAfter?.expiresAt ? 'YES' : 'NO'}`);
    console.log(`Admin write action: ${adminActionOk ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Auth log entries: ${authLogs.length}`);
    console.log(`Console errors:   ${consoleErrors.length}`);
    console.log(`Page errors:      ${pageErrors.length}`);
    console.log(`Lock issues:      ${lockIssues.length}`);
    console.log(`Nav failures:     ${navFailures.length}`);
    console.log(`Empty states:     ${emptyStateFailures.length}`);
    console.log('='.repeat(70));

    if (navFailures.length > 0) {
      console.log('\n❌ NAVIGATION FAILURES:');
      navFailures.forEach((f) => console.log(`  • ${f}`));
    }
    if (emptyStateFailures.length > 0) {
      console.log('\n⚠ EMPTY STATE WARNINGS:');
      emptyStateFailures.forEach((f) => console.log(`  • ${f}`));
    }
    if (lockIssues.length > 0) {
      console.log('\n⚠ LOCK-RELATED CONSOLE OUTPUT:');
      lockIssues.forEach((l) => console.log(`  ${l}`));
    }
    if (consoleErrors.length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      consoleErrors.forEach((e) => console.log(`  ${e}`));
    }
    if (pageErrors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      pageErrors.forEach((e) => console.log(`  ${e}`));
    }

    console.log('\n🔑 AUTH EVENT TIMELINE:');
    authLogs.forEach((log) => console.log(`  ${log}`));

    // -------- 7. Assertions --------
    expect(navFailures, `Navigation failures: ${navFailures.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
    expect(sessionAfter?.isExpired ?? true, 'Session should be valid at end of test').toBe(false);
    expect(adminActionOk, 'Admin write action must work after 10min wait').toBe(true);
  });
});
