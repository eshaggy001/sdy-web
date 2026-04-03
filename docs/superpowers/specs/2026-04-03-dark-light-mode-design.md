# Dark/Light Mode Design Spec

## Overview

SDY вэбсайтад light/dark mode toggle нэмнэ. Tailwind CSS v4-ийн class-based dark variant (`dark:`) ашиглана. Default нь light mode. Theme toggle Navbar дээр байрлана. Admin хэсэг ч бас theme дагана.

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Default theme | Light | User preference |
| Toggle location | Navbar | Бүх хуудаснаас харагдана |
| Admin theming | Theme дагана | Admin хэсэг ч light/dark хоёулаа дэмжинэ |
| Approach | CSS class + `dark:` prefix | Tailwind v4 native, component-level хяналт |

## Architecture

### 1. ThemeContext (`src/contexts/ThemeContext.tsx`)

I18nContext pattern дагана.

```typescript
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
```

- `ThemeProvider` — `App.tsx` дээр wrap
- `useTheme()` hook — theme утга, toggle функц буцаана
- localStorage key: `sdy_theme`
- Анх ачаалахад: localStorage утга → байхгүй бол `'light'`
- `<html>` element дээр `class="dark"` нэмж/хасна (`document.documentElement.classList`)

### 2. ThemeToggle Component (`src/components/ThemeToggle.tsx`)

- Navbar дотор байрлана (language toggle-ийн хажууд)
- `lucide-react`-ийн `Sun` / `Moon` icon
- Rotate transition animation
- `useTheme()` hook ашиглана

### 3. Tailwind v4 Dark Mode Config (`src/index.css`)

```css
@custom-variant dark (&:where(.dark *));
```

Одоо байгаа utility class-уудад dark variant нэмнэ:
- `.glass-nav` — dark background, border
- `.btn-primary`, `.btn-secondary`, `.btn-outline-white` — dark colors
- `.card-shadow` — dark shadow
- `.input`, `.input-dark` — dark form styles
- `.section-label` — dark text

### 4. FOUC Prevention (`index.html`)

```html
<script>
  if (localStorage.getItem('sdy_theme') === 'dark')
    document.documentElement.classList.add('dark')
</script>
```

`<head>` дотор, React ачаалахаас өмнө ажиллана.

### 5. Component Dark Styles

**Public pages — dark mode mapping:**
- `bg-white` → `dark:bg-gray-900`
- `bg-gray-50`, `bg-gray-100` → `dark:bg-gray-800`
- `text-sdy-black`, `text-gray-900` → `dark:text-white`, `dark:text-gray-100`
- `text-gray-600`, `text-gray-700` → `dark:text-gray-300`, `dark:text-gray-400`
- `border-gray-200` → `dark:border-gray-700`
- `shadow-*` → `dark:shadow-*` (darker variants)

**Admin pages — light mode нэмэх (одоо hardcoded dark):**
- `bg-[#0c0c10]` → `bg-white dark:bg-[#0c0c10]`
- `bg-[#16161a]` → `bg-gray-50 dark:bg-[#16161a]`
- `text-white` → `text-gray-900 dark:text-white`
- `bg-white/5` → `bg-gray-100 dark:bg-white/5`
- `text-gray-400/500` → `text-gray-600 dark:text-gray-400`

**Navbar, Footer** — dark variant-ууд нэмнэ.

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/ThemeContext.tsx` | Theme state management |
| `src/components/ThemeToggle.tsx` | Toggle button component |

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | FOUC prevention script |
| `src/index.css` | `@custom-variant dark` + utility dark styles |
| `src/App.tsx` | `ThemeProvider` wrap |
| `src/components/Navbar.tsx` | ThemeToggle нэмэх + dark styles |
| `src/components/Footer.tsx` | Dark styles |
| `src/components/admin/AdminLayout.tsx` | Light mode styles нэмэх |
| `src/components/admin/AdminSidebar.tsx` | Light mode styles нэмэх |
| All page components | `dark:` class-ууд нэмэх |

## Out of Scope

- System preference (`prefers-color-scheme`) автомат detect — хэрэгтэй бол дараа нэмнэ
- Dark mode-д зориулсан шинэ өнгө (brand color) нэмэхгүй — SDY red тэр чигээрээ
- Transition animation (theme солих үед бүх page fade) — хэрэггүй
