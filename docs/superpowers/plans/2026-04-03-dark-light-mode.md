# Dark/Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add light/dark mode toggle to the SDY website with localStorage persistence, FOUC prevention, and dark variants for all public and admin pages.

**Architecture:** ThemeContext (following I18nContext pattern) manages `'light' | 'dark'` state via `<html class="dark">`. Tailwind v4 `@custom-variant dark` enables `dark:` prefix. All components get `dark:` class additions.

**Tech Stack:** React 19, Tailwind CSS v4 (`@custom-variant`), lucide-react (Sun/Moon icons), localStorage

---

### Task 1: Tailwind v4 Dark Mode Configuration

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add `@custom-variant` for dark mode**

At the top of `src/index.css`, right after `@import "tailwindcss";`, add:

```css
@custom-variant dark (&:where(.dark *));
```

- [ ] **Step 2: Add dark variants to base layer**

Update the `@layer base` block body styles:

```css
@layer base {
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  body {
    @apply bg-sdy-gray text-sdy-black font-sans antialiased overflow-x-hidden dark:bg-gray-950 dark:text-gray-100;
    background-color: var(--color-sdy-gray);
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight text-sdy-black dark:text-white;
  }

  ::selection {
    background-color: var(--color-sdy-red);
    color: white;
  }
}
```

- [ ] **Step 3: Add dark variants to utility classes**

Update each utility class in `@layer utilities`:

```css
.glass-nav {
  @apply fixed top-0 z-50 w-full border-b border-black/5 bg-white/90 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-gray-950/90;
}

.glass-card {
  @apply rounded-2xl border border-white/40 bg-white/60 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)];
}

.card-shadow {
  @apply bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100/80 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)];
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-xl border-2 border-sdy-black/10 bg-white px-8 py-4 text-base font-bold text-sdy-black transition-all duration-300 hover:bg-sdy-black hover:text-white hover:border-sdy-black active:scale-[0.97] dark:border-white/20 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-sdy-black dark:hover:border-white;
}

.input {
  @apply w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-sdy-red;
}

.section-label {
  @apply inline-flex items-center gap-2 text-sdy-red font-black uppercase tracking-[0.15em] text-[11px] mb-5;
}

.section-divider {
  @apply border-t border-gray-100 dark:border-gray-800;
}
```

Note: `.btn-primary`, `.btn-outline-white`, `.nav-active`, `.section-label` need no dark changes — they already use brand colors (red/white) that work on both backgrounds.

- [ ] **Step 4: Verify CSS compiles**

Run: `npm run build`
Expected: Build succeeds with no CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: add Tailwind v4 dark mode variant and dark styles for utility classes"
```

---

### Task 2: ThemeContext

**Files:**
- Create: `src/contexts/ThemeContext.tsx`

- [ ] **Step 1: Create ThemeContext**

```tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sdy_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sdy_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/ThemeContext.tsx
git commit -m "feat: add ThemeContext for light/dark mode state management"
```

---

### Task 3: ThemeToggle Component

**Files:**
- Create: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle**

```tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 hover:border-sdy-red/40 dark:hover:border-sdy-red/40 transition-all bg-white/60 dark:bg-gray-800/60"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={15} className="text-sdy-black/60 transition-transform duration-300" />
      ) : (
        <Sun size={15} className="text-yellow-400 transition-transform duration-300" />
      )}
    </button>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component with sun/moon icons"
```

---

### Task 4: Wire ThemeProvider and ThemeToggle

**Files:**
- Modify: `src/App.tsx`
- Modify: `index.html`
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Add FOUC prevention script to `index.html`**

Add this script inside `<head>`, after the `<title>` tag:

```html
<script>
  if (localStorage.getItem('sdy_theme') === 'dark')
    document.documentElement.classList.add('dark')
</script>
```

- [ ] **Step 2: Wrap app with ThemeProvider in `src/App.tsx`**

Add import:
```tsx
import { ThemeProvider } from './contexts/ThemeContext';
```

Wrap `ThemeProvider` around `AuthProvider` in the `App` function:

```tsx
export default function App() {
  return (
    <HelmetProvider>
    <Router>
      <I18nProvider>
      <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      </ThemeProvider>
      </I18nProvider>
    </Router>
    </HelmetProvider>
  );
}
```

- [ ] **Step 3: Add ThemeToggle to Navbar**

In `src/components/Navbar.tsx`, add import:
```tsx
import { ThemeToggle } from './ThemeToggle';
```

In the desktop right controls section (`hidden md:flex items-center gap-3`), add `<ThemeToggle />` before the language toggle button:

```tsx
<div className="hidden md:flex items-center gap-3">
  {/* Theme Toggle */}
  <ThemeToggle />

  {/* Language Toggle */}
  <button
    onClick={toggleLanguage}
    ...
```

In the mobile controls section (`md:hidden flex items-center gap-3`), add `<ThemeToggle />` before the language toggle:

```tsx
<div className="md:hidden flex items-center gap-3">
  <ThemeToggle />
  <button
    onClick={toggleLanguage}
    ...
```

- [ ] **Step 4: Test toggle works**

Run: `npm run dev`
Open browser, click the moon/sun icon. Verify:
- `<html>` gets/loses `class="dark"`
- localStorage `sdy_theme` updates
- Page refresh preserves the theme choice
- No flash of white on dark mode reload

- [ ] **Step 5: Commit**

```bash
git add index.html src/App.tsx src/components/Navbar.tsx
git commit -m "feat: wire ThemeProvider, FOUC prevention, and ThemeToggle in Navbar"
```

---

### Task 5: Navbar Dark Styles

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Update Navbar scroll states**

In the `<nav>` className, update the scrolled ternary:

```tsx
<nav
  className={`fixed top-0 z-50 w-full transition-all duration-300 ${
    scrolled
      ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.3)] py-3'
      : 'bg-white/0 py-5'
  }`}
>
```

- [ ] **Step 2: Update desktop nav link styles**

In the desktop nav link className:

```tsx
className={`relative px-3 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${
  active
    ? 'text-sdy-red'
    : 'text-sdy-black/70 dark:text-gray-300 hover:text-sdy-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
}`}
```

- [ ] **Step 3: Update language toggle buttons**

Desktop language toggle:
```tsx
className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-sdy-red/40 transition-all font-black text-[11px] uppercase tracking-widest text-sdy-black/60 dark:text-gray-400 hover:text-sdy-red bg-white/60 dark:bg-gray-800/60"
```

Mobile language toggle:
```tsx
className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 font-black text-[11px] uppercase tracking-widest text-sdy-black dark:text-gray-300"
```

- [ ] **Step 4: Update mobile menu button and drawer**

Mobile hamburger button:
```tsx
className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sdy-black dark:text-white"
```

Mobile drawer container:
```tsx
className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl"
```

Mobile nav link (inactive state):
```tsx
className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-base transition-colors ${
  active
    ? 'bg-sdy-red/8 text-sdy-red'
    : 'text-sdy-black dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
}`}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add dark mode styles to Navbar"
```

---

### Task 6: Footer Dark Styles

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Update Footer**

The footer already uses `bg-sdy-black text-white` — it looks good in both modes. No dark variant changes needed since it's intentionally always dark.

Mark this task as complete — no changes required.

- [ ] **Step 2: Commit (skip — no changes)**

---

### Task 7: Public Page Dark Styles — Home Components

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/ImpactBar.tsx`
- Modify: `src/components/Pillars.tsx`
- Modify: `src/components/Programs.tsx`
- Modify: `src/components/News.tsx`
- Modify: `src/components/JoinFlow.tsx`
- Modify: `src/components/PollsSection.tsx`
- Modify: `src/components/PollCard.tsx`

- [ ] **Step 1: Update Hero.tsx**

Section background:
```tsx
<section className="relative min-h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-950">
```

Watermark opacity — update `text-gray-400` to include dark:
```tsx
className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[72vw] max-w-[860px] text-gray-400 dark:text-gray-600 opacity-[0.09] z-0 pointer-events-none select-none"
```

Headline `text-sdy-black` → add `dark:text-white`:
```tsx
className="font-black text-sdy-black dark:text-white tracking-tighter leading-[0.93] mb-8"
```

Subtitle `text-gray-500`:
```tsx
className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-[480px] font-medium"
```

Eyebrow badge:
```tsx
className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sdy-red/8 border border-sdy-red/15 w-fit mb-8"
```
(No change needed — red on transparent works in both modes.)

- [ ] **Step 2: Update ImpactBar, Pillars, Programs, News, JoinFlow, PollsSection, PollCard**

For each component, apply the same pattern:
- `bg-white` → `bg-white dark:bg-gray-950`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- `bg-gray-100` → `bg-gray-100 dark:bg-gray-800`
- `text-sdy-black` → `text-sdy-black dark:text-white`
- `text-gray-600` / `text-gray-700` → add `dark:text-gray-300` / `dark:text-gray-400`
- `text-gray-500` → add `dark:text-gray-400`
- `text-gray-400` → add `dark:text-gray-500`
- `border-gray-100` / `border-gray-200` → add `dark:border-gray-800` / `dark:border-gray-700`
- `hover:bg-gray-50` → add `dark:hover:bg-gray-800`
- `shadow-*` with light values → add appropriate `dark:shadow-*`

Read each file, find all instances of these patterns, and add the dark variants. Do not change any logic — only add `dark:` Tailwind classes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx src/components/ImpactBar.tsx src/components/Pillars.tsx src/components/Programs.tsx src/components/News.tsx src/components/JoinFlow.tsx src/components/PollsSection.tsx src/components/PollCard.tsx
git commit -m "feat: add dark mode styles to Home page components"
```

---

### Task 8: Public Page Dark Styles — Content Pages

**Files:**
- Modify: `src/pages/About.tsx`
- Modify: `src/pages/Ideology.tsx`
- Modify: `src/pages/ProgramsPage.tsx`
- Modify: `src/pages/ProgramDetailPage.tsx`
- Modify: `src/pages/NewsPage.tsx`
- Modify: `src/pages/NewsDetailPage.tsx`
- Modify: `src/pages/JoinPage.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/pages/PollsPage.tsx`

- [ ] **Step 1: Apply dark classes to each page**

Same mapping as Task 7:
- `bg-white` → `bg-white dark:bg-gray-950`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- `text-sdy-black` → `text-sdy-black dark:text-white`
- `text-gray-600` → `text-gray-600 dark:text-gray-300`
- `text-gray-500` → `text-gray-500 dark:text-gray-400`
- `border-gray-100` → `border-gray-100 dark:border-gray-800`
- `border-gray-200` → `border-gray-200 dark:border-gray-700`
- `hover:bg-gray-50` → `hover:bg-gray-50 dark:hover:bg-gray-800`

Read each file fully before editing. Only add `dark:` classes — no logic changes.

- [ ] **Step 2: Commit**

```bash
git add src/pages/About.tsx src/pages/Ideology.tsx src/pages/ProgramsPage.tsx src/pages/ProgramDetailPage.tsx src/pages/NewsPage.tsx src/pages/NewsDetailPage.tsx src/pages/JoinPage.tsx src/pages/ContactPage.tsx src/pages/PollsPage.tsx
git commit -m "feat: add dark mode styles to public content pages"
```

---

### Task 9: Admin Pages — Add Light Mode (Currently Hardcoded Dark)

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/pages/AdminDashboardPage.tsx`
- Modify: `src/pages/AdminProgramsPage.tsx`
- Modify: `src/pages/AdminNewsPage.tsx`
- Modify: `src/pages/AdminLeadersPage.tsx`
- Modify: `src/pages/AdminPillarsPage.tsx`
- Modify: `src/pages/AdminStatsPage.tsx`
- Modify: `src/pages/AdminPollsPage.tsx`
- Modify: `src/pages/AdminRegistrationsPage.tsx`
- Modify: `src/pages/AdminSubmissionsPage.tsx`
- Modify: `src/pages/AdminUsersPage.tsx`
- Modify: `src/pages/AdminLoginPage.tsx`
- Modify: `src/pages/AdminForgotPasswordPage.tsx`
- Modify: `src/pages/AdminResetPasswordPage.tsx`

- [ ] **Step 1: Update AdminLayout.tsx**

```tsx
<div className="flex min-h-screen bg-gray-50 dark:bg-[#0c0c10]">
```

- [ ] **Step 2: Update AdminSidebar.tsx**

Apply this mapping throughout the file:
- `bg-[#111114]` → `bg-white dark:bg-[#111114]`
- `bg-[#16161a]` → `bg-gray-50 dark:bg-[#16161a]`
- `text-white` (for labels/names) → `text-gray-900 dark:text-white`
- `text-gray-500` → `text-gray-500 dark:text-gray-500` (no change needed)
- `border-white/6` → `border-gray-200 dark:border-white/6`
- `bg-white/5` → `bg-gray-100 dark:bg-white/5`
- `hover:bg-white/5` → `hover:bg-gray-100 dark:hover:bg-white/5`
- `bg-white/8` → `bg-gray-100 dark:bg-white/8`
- `border-white/8` → `border-gray-200 dark:border-white/8`
- `bg-black/60` (overlay) → `bg-black/30 dark:bg-black/60`

Specific elements:
- Desktop sidebar: `bg-white dark:bg-[#111114] border-r border-gray-200 dark:border-white/6`
- Mobile overlay sidebar: `bg-white dark:bg-[#111114]`
- Mobile toggle button: `bg-gray-100 dark:bg-[#16161a] border border-gray-200 dark:border-white/8`
- Nav active state: `bg-sdy-red/12 text-sdy-red` (no change — works in both)
- Nav inactive state: `text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300`
- User avatar: `bg-gray-100 dark:bg-white/8`
- User name: `text-gray-900 dark:text-white`

- [ ] **Step 3: Update AdminDashboardPage.tsx**

Apply this mapping:
- `bg-[#16161a]` → `bg-white dark:bg-[#16161a]`
- `border-white/[0.04]` → `border-gray-200 dark:border-white/[0.04]`
- `text-white` (for data values) → `text-gray-900 dark:text-white`
- `text-gray-500` → `text-gray-500` (keep as-is, readable in both)
- `text-gray-600` → `text-gray-500 dark:text-gray-600`
- `text-gray-700` → `text-gray-600 dark:text-gray-700`
- `bg-white/5` (skeleton) → `bg-gray-200 dark:bg-white/5`

- [ ] **Step 4: Update remaining admin pages**

Read each admin page file and apply the same pattern as Step 3. All admin pages follow the same dark-first design pattern with `bg-[#16161a]`, `border-white/[0.04]`, `text-white`, etc.

For each file:
1. Read it fully
2. Find all hardcoded dark color classes
3. Add light mode equivalents and move dark colors to `dark:` prefix

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminLayout.tsx src/components/admin/AdminSidebar.tsx src/pages/Admin*.tsx
git commit -m "feat: add light mode styles to admin pages (theme-aware)"
```

---

### Task 10: Final Verification

**Files:** None (testing only)

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run type check**

Run: `npm run lint`
Expected: No TypeScript errors.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`

Check the following pages in both light and dark mode:
- Home page (all sections)
- About page
- Programs page
- News page
- Contact page
- Join page
- Admin login
- Admin dashboard
- Admin sidebar (collapsed + expanded)

Verify:
- Toggle works on desktop and mobile
- Theme persists across page refresh
- No FOUC on dark mode reload
- All text is readable on both backgrounds
- No hardcoded colors conflicting with theme
- Admin pages look good in both light and dark

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: polish dark mode styles after visual review"
```
