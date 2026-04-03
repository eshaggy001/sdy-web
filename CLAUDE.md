# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # TypeScript type check (tsc --noEmit)
npm run clean      # Remove dist/
```

**Environment:** Copy `.env.local` and set `GEMINI_API_KEY` to your Gemini API key before running.

**Validation scripts** (from `.claude/` toolkit):
```bash
python .agent/scripts/checklist.py .                         # Pre-commit checks
python .agent/scripts/verify_all.py . --url http://localhost:3000  # Pre-deploy full suite
```

## Architecture

This is a **React 19 + Vite + TypeScript** single-page application for **SDY** (Залуучуудын Ардчилсан Намын — a Mongolian youth political organization). It uses Tailwind CSS v4, React Router v7, and Framer Motion (via `motion/react`).

### Routing & Internationalization

All routes are prefixed with a language segment (`/mn` or `/en`). The app redirects `/` → `/mn` by default.

- `/:lang` → `Home`, `About`, `Ideology`, `Programs`, `News`, `Join`, `Contact`, `Polls`, `AdminPolls`
- `I18nContext` (`src/contexts/I18nContext.tsx`) manages language state, syncing between URL path and `localStorage` (`sdy_lang`).
- **`t(content)`** — translates a `{ mn: string; en: string }` object to the active language.
- **`l(path)`** — prepends the active language prefix to a path (e.g. `/about` → `/mn/about`).

### Data Layer

All data is **client-side only** — no backend API. Content lives in `src/constants.ts` as typed arrays (`PILLARS`, `PROGRAMS`, `NEWS_ITEMS`, etc.).

The exception is polls: `src/services/pollService.ts` manages poll CRUD and voting via `localStorage` (`sdy_polls`, `sdy_user_votes`). The admin panel at `/admin/polls` is unprotected (no auth).

### Key Types

`src/types.ts` defines the shared type system. The central pattern is `LocalizedString`:

```ts
interface LocalizedString { mn: string; en: string; }
```

All content fields (`title`, `description`, `label`, etc.) use `LocalizedString` and are rendered through `t()`.

### Path Alias

`@/` maps to the repo root (not `src/`). Import from root like `@/src/types` or `@/src/constants`.

### Agent/Skills Toolkit

The `.claude/` directory contains the **Antigravity Kit** — 20 specialist agents, 36 skills, and 11 workflow slash commands. See `.claude/ARCHITECTURE.md` for the full index. The global rules for agent behavior are in `.claude/rules/GEMINI.md`.
