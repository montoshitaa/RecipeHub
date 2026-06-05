# Stack Research: RecipeHub Frontend

**Domain:** Collaborative recipe platform — React 18 + Vite frontend
**Researched:** 2026-06-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3.1 | UI library | Existing — no change needed |
| Vite | 5.4.21 | Build tool / dev server | Existing stack — bump patch version for bug fixes. Do NOT upgrade to Vite 6 (test churn with no benefit for this scope) |
| react-router-dom | 6.30.4 | Client-side routing | Existing — bump from 6.26.0 to latest v6. Stays on v6 (v7 has breaking API changes; zero benefit for this project) |
| Tailwind CSS | 4.3.0 | Utility-first CSS framework | Vite-native plugin (`@tailwindcss/vite`). No config file needed for basic usage. Responsive design is a first-class primitive via breakpoint prefixes. Perfect for "responsive, polished UI" requirement |
| @tailwindcss/vite | 4.3.0 | Tailwind Vite integration | Required for Tailwind v4 in Vite projects. Replaces PostCSS config approach from v3 |
| shadcn/ui CLI | 4.10.0 | UI component toolkit | Copy-paste accessible components built on Radix UI + Tailwind. You own the code — no black-box npm dependency. Ships Card, Form, Dialog, Tabs, Avatar, Badge, DropdownMenu, Input, Textarea, Select, Button — all needed for this phase |
| react-hook-form | 7.77.0 | Form state management | Industry standard for React forms. Minimal re-renders (uncontrolled by default). Integrates with Zod via `@hookform/resolvers`. Handles dynamic field arrays (ingredients list, steps list) natively |
| zod | 3.25.76 | Schema validation | TypeScript-first validation with static type inference. Use v3 (not v4 — v4 is too new and `@hookform/resolvers` may not fully support it yet). Validates complex nested objects (ingredients with name/amount/unit) |
| axios | 1.17.0 | HTTP client | Existing — bump from 1.7.2. Handles multipart uploads with `FormData` for image upload |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 5.4.0 | Zod ↔ React Hook Form bridge | Every form. Pass `zodResolver(schema)` to `useForm()` |
| react-dropzone | 15.0.0 | Drag-and-drop file upload zone | Recipe create/edit forms. Provides `useDropzone` hook with preview generation, file type validation, drag state |
| lucide-react | 0.547.0 | SVG icon library | Every icon in the app. 1,700+ icons, tree-shakeable (only bundles imported icons). Use for nav items, form labels, action buttons, difficulty badges |
| sonner | 2.0.7 | Toast notifications | Success/error feedback after recipe save, image upload, comment post, auth actions. `toast.success()`, `toast.error()` API. Install `<Toaster />` once in root |
| multer | 2.1.1 | Backend multipart upload middleware | New `POST /api/upload` endpoint for image uploads. Disk or memory storage. Validate file type (image/*) and size (5MB max) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @vitejs/plugin-react | 4.7.0 | React Fast Refresh for Vite | Existing — bump from 4.3.1 for Vite 5.4 compat |
| shadcn CLI | 4.10.0 | Component scaffolding | Run `npx shadcn@latest init` once, then `npx shadcn@latest add <component>` to pull in individual components to `src/components/ui/` |

## Installation

```bash
# Existing dep bumps (frontend/)
npm install react-router-dom@6.30.4 axios@1.17.0
npm install -D vite@5.4.21 @vitejs/plugin-react@4.7.0

# Styling
npm install tailwindcss@4.3.0 @tailwindcss/vite@4.3.0

# Forms
npm install react-hook-form@7.77.0 zod@3.25.76 @hookform/resolvers@5.4.0

# Image upload (frontend)
npm install react-dropzone@15.0.0

# UI polish
npm install lucide-react@0.547.0 sonner@2.0.7

# Backend image upload (backend/)
npm install multer@2.1.1
```

### shadcn/ui setup (separate step)

```bash
# Initialize shadcn/ui (run once, in frontend/)
npx shadcn@4.10.0 init

# Add components as needed
npx shadcn@latest add card button input textarea select form dialog tabs avatar badge dropdown-menu
```

## Configuration Changes

### vite.config.js — add Tailwind plugin

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

### src/index.css — enable Tailwind

```css
@import "tailwindcss";
```

Remove any existing CSS in this file. Tailwind v4 uses `@import` (not the old `@tailwind base/components/utilities` directives from v3).

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Tailwind CSS v4 | MUI / Ant Design / Chakra UI | Heavy, opinionated design systems that fight Tailwind. Bundle size bloat (MUI: ~100KB gzipped minimum). Harder to achieve custom "polished" look |
| Tailwind CSS v4 | styled-components / CSS Modules | Adds runtime cost (styled-components) or creates scattered `.module.css` files. Tailwind co-locates styles in JSX and eliminates naming conventions |
| shadcn/ui | Headless UI (Tailwind Labs) | Headless UI has fewer components and less active maintenance. shadcn/ui has broader component coverage and larger community |
| shadcn/ui | No component library (raw Tailwind) | Viable lightweight path if you want to hand-build modals, tabs, dropdowns. shadcn saves 2-3 days of accessibility boilerplate on the components this phase needs |
| react-hook-form | Formik | More re-renders (controlled components by default). Larger bundle. RHF is 2x smaller and the React ecosystem standard since 2021 |
| zod v3 | zod v4 | v4.0.1 released very recently. `@hookform/resolvers` ecosystem support unconfirmed. v3 is stable, fully supported, and has identical API for this project's needs |
| zod | Yup | Yup is larger (59KB vs Zod's 13KB) and doesn't provide TypeScript type inference from schemas |
| react-dropzone | react-dropzone-uploader / custom `<input type="file">` | react-dropzone-uploader is unmaintained (last release 2021). Native file input works but no drag-and-drop, no preview generation — bad UX for a recipe app where image preview is key |
| sonner | react-hot-toast | Both are good. sonner has slightly cleaner API, better default styling, and integrates more naturally with Tailwind |
| lucide-react | react-icons / heroicons | react-icons bundles ALL icon sets (huge). heroicons has only 300 icons (lucide has 1,700+). lucide is tree-shakeable per-icon |
| React Router v6 | React Router v7 | v7 is a framework-first release with breaking API changes. Zero benefit for this SPA. v6.30.4 is the stable LTS-equivalent |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| CSS-in-JS (styled-components, emotion) | Runtime overhead, no benefit over utility CSS for this project | Tailwind CSS v4 |
| CSS Modules | Creates scattered `.module.css` files with naming conventions. Harder to maintain consistency across pages | Tailwind CSS v4 |
| MUI / Ant Design / Chakra UI | Heavy component libraries. Opinionated design that's hard to customize. Conflict with Tailwind | shadcn/ui (lightweight, you own the code) |
| Formik | Legacy. More re-renders, larger bundle. Community has moved on | react-hook-form + zod |
| Zod v4 | Too new (April 2026). Resolver support unverified. Breaking changes from v3 | Zod v3.25.x |
| React Router v7 | Breaking API changes from v6. Framework-first design (SSR focus) — overkill for this SPA | React Router v6.30.4 |
| React 19 | Requires upgrading React itself. Unnecessary risk — v18 works perfectly | React 18.3.1 (existing) |
| Global state library (Redux, Zustand, Jotai) | Explicitly out of scope per project constraints. Auth context + API calls suffice | React Context + axios |
| Bootstrap | Conflicts with Tailwind philosophy. Less flexible for custom "polished" design | Tailwind CSS v4 |

## Stack Patterns by Variant

**If you want maximum speed (recommended):**
- Use shadcn/ui components for Card, Form, Button, Input, Dialog, Tabs, Badge
- This covers 80% of the UI needed in this phase
- Saves building accessible modals, dropdowns, tabs from scratch

**If you want minimum dependencies:**
- Skip shadcn/ui entirely
- Build all components with raw Tailwind classes
- Use `<dialog>` element for modals (good browser support as of 2026)
- Must handle keyboard navigation, focus trapping, and ARIA attributes manually

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @tailwindcss/vite@4.3.0 | vite@^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8 | Works with existing Vite 5.4.x |
| react-hook-form@7.77.0 | react@^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19 | Existing React 18 is fine |
| @hookform/resolvers@5.4.0 | react-hook-form@^7.55.0 | RHF 7.77.0 satisfies this |
| @hookform/resolvers@5.4.0 + zod@3.25.x | — | Officially supported. zodResolver import path: `@hookform/resolvers/zod` |
| react-dropzone@15.0.0 | react@^18.0.0 \|\| ^19.0.0 | Existing React 18 is fine |
| shadcn/ui CLI@4.10.0 | tailwindcss@4.x | shadcn v4 was built for Tailwind v4 |
| multer@2.1.1 | express@^4.0.0 | Existing Express 4.21.0 is fine |
| react-router-dom@6.30.4 | react@^16.8 \|\| ^17 \|\| ^18 | Existing React 18 is fine. No migration needed from 6.26.0 |

## Sources

- [Context7] `/websites/tailwindcss` — Vite installation, Tailwind v4 setup, verified `@tailwindcss/vite` plugin configuration
- [Context7] `/react-hook-form/documentation` — Zod resolver integration, `useForm` API, schema validation patterns
- [Context7] `/shadcn-ui/ui` — Vite installation guide, Tailwind v4 compatibility, component catalog
- [Context7] `/websites/react-dropzone_js` — Hook API, file preview, drag-and-drop zone configuration
- [npm registry] — All version numbers verified via `npm view` on 2026-06-04
- [Official docs] https://tailwindcss.com/docs/installation/framework-guides/vite — Tailwind v4 Vite setup
- [Official docs] https://ui.shadcn.com/docs/installation/vite — shadcn/ui Vite installation
- [GitHub] https://github.com/react-hook-form/react-hook-form — RHF v7.77.0 release notes
- [GitHub] https://github.com/colinhacks/zod — Zod v3.25.x changelog, v4 status

---

*Stack research for: RecipeHub Frontend*
*Researched: 2026-06-04*
