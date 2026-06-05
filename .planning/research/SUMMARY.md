# Project Research Summary

**Project:** RecipeHub Frontend
**Domain:** Collaborative recipe platform — React 18 + Vite frontend
**Researched:** 2026-06-04
**Confidence:** HIGH

## Executive Summary

RecipeHub is a collaborative recipe platform with an existing React 18 + Vite frontend that needs a major UI overhaul. This milestone adds Tailwind CSS v4 + shadcn/ui for a polished, responsive redesign, replaces stub pages with fully functional recipe CRUD and social features (comments, ratings), and introduces image upload with drag-and-drop.

The recommended approach is **incremental enhancement of the existing codebase** rather than a rewrite. The established architecture — AuthProvider context, page-level data fetching with local state, and API module pattern — remains sound and should be extended, not replaced. The core addition is Tailwind CSS v4 via the `@tailwindcss/vite` plugin (zero-runtime, no config file needed) paired with shadcn/ui for accessible, copy-paste components. All forms should use react-hook-form + Zod for validation, with `useFieldArray` for dynamic ingredient and step lists. Image upload requires a new `POST /api/upload` backend endpoint using multer, built before or in parallel with the frontend dropzone UI.

The key risks are all preventable with discipline: (1) accidentally applying Tailwind v3 configuration patterns to v4, (2) managing dynamic form fields with `useState` instead of `useFieldArray`, (3) building the image upload UI before the backend endpoint exists, and (4) shadcn/ui generating TypeScript files that break in the JSX codebase. Each has a clear, low-effort prevention strategy documented in the pitfall research. The overall research confidence is HIGH — all technology decisions are backed by official documentation, npm registry verification, and review of the existing codebase.

## Key Findings

### Recommended Stack

The stack keeps the existing React 18 + Vite core while adding Tailwind CSS v4 for styling (replacing whatever CSS approach was previously used), shadcn/ui for accessible UI components, react-hook-form + Zod for form management, react-dropzone for image upload UX, sonner for toast notifications, and lucide-react for icons. All libraries were selected for minimal bundle impact, zero-runtime cost, and strong ecosystem support.

**Core technologies:**
- **Tailwind CSS v4 + @tailwindcss/vite**: Utility-first CSS with zero runtime cost. Vite-native plugin replaces PostCSS config. Responsive design via breakpoint prefixes. Do NOT create `tailwind.config.js` or `postcss.config.js` — v4 uses `@import "tailwindcss"` in CSS.
- **shadcn/ui 4.10.0**: Copy-paste component library built on Radix UI + Tailwind. You own the code — no black-box npm dependency. Provides Card, Form, Dialog, Tabs, Avatar, Badge, Button, Input, Select, Textarea, DropdownMenu, and Skeleton. Saves 2-3 days of accessibility boilerplate.
- **react-hook-form 7.77.0 + zod 3.25.76**: Industry-standard form management with minimal re-renders. `useFieldArray` handles dynamic ingredient rows and step lists without stale-state bugs. Zod provides TypeScript-first schema validation with static type inference. Use Zod v3 (not v4 — resolver support unverified).
- **react-dropzone 15.0.0**: Drag-and-drop file upload with preview generation, file type validation, and drag state. Far better UX than a raw `<input type="file">`.
- **lucide-react 0.547.0**: 1,700+ SVG icons, tree-shakeable per-icon. No bundle bloat.
- **sonner 2.0.7**: Toast notifications with clean API (`toast.success()`, `toast.error()`). Integrates naturally with Tailwind.
- **multer 2.1.1 (backend)**: Multipart upload middleware for the new `POST /api/upload` endpoint. Disk or memory storage, file type/size validation.

**What NOT to use:** MUI/Ant Design/Chakra UI (heavy, fight Tailwind), Formik (legacy), Zod v4 (too new), React Router v7 (breaking changes, framework-first), CSS-in-JS (runtime overhead), Bootstrap (conflicts with Tailwind), Redux/Zustand (out of scope — React Context suffices).

### Expected Features

**Must have (table stakes):**
- Recipe feed with cards (grid layout, image/title/author/difficulty badge/cook time) — users expect content browsing
- Recipe filtering and search (category, difficulty, tags, free-text, debounced 300ms, URL query params) — users expect to narrow results
- Recipe detail page (hero image, ingredients, steps, author info, comments with star ratings) — users expect full recipe viewing
- Create/edit recipe form (multi-field with dynamic ingredient rows and step list) — users expect to publish content
- Image upload with drag-and-drop preview — standard UX for 2026
- Authentication UI (login/register forms, JWT token storage, protected route redirects) — existing routes but stub pages
- Responsive design (mobile/tablet/desktop via Tailwind breakpoints) — non-negotiable for a consumer web app
- Loading states (skeleton loaders for cards, spinners for full-page), error states (form field errors, toast notifications, 404 page), empty states (friendly messages when no data exists)

**Should have (differentiators):**
- Difficulty badge with color coding (Easy=green, Medium=yellow, Hard=red) — trivial to implement, high visual impact
- Ingredient checklist on detail page (check off as you cook, local state only) — distinctive UX other recipe sites lack
- Recipe image as hero banner (full-width with overlay gradient) — premium feel
- Time and servings summary bar (⏱ 45 min · 🍽 4 servings · 🔥 Medium) — quick-glance info strip

**Defer (v2+):**
- Comment threading (nested replies) — clarify requirement first
- Skeleton loaders — add after pages render correctly with spinners
- Social features (following, likes, activity feeds) — explicitly out of scope

**Anti-features (explicitly NOT building):**
- Infinite scroll (premature complexity — use paginated feed)
- Real-time updates/WebSocket (massive complexity — poll on revisit)
- WYSIWYG recipe editor (ContentEditable minefield — use structured form fields)
- OAuth/social login (explicitly out of scope)
- Global state library (React Context + API calls suffice)

### Architecture Approach

The architecture follows the **existing project pattern**: React SPA with BrowserRouter, AuthProvider context wrapping all routes, page-level data fetching with `useState`/`useEffect`, and API modules in `src/api/`. No global state library — each page fetches and manages its own data. The key addition is Tailwind v4 + shadcn/ui for styling and components, react-hook-form + Zod for all forms, and Sonner for toast notifications at the App root level.

**Major components:**
1. **AuthProvider** — Holds `user` state + JWT token. Provides `useAuth()` hook. Handles login/logout, protected route gating, and auth header injection via axios interceptor.
2. **Navbar** — Top navigation with logo, nav links, user menu. Responsive hamburger on mobile. Reads from AuthProvider for user state. Present on all pages.
3. **HomePage** — Recipe feed with filter bar. Renders grid of RecipeCard components. Fetches `GET /api/recipes` with query params. URL query params for shareable filter state.
4. **RecipeCard** — Single recipe preview (image, title, author, difficulty badge, cook time). Links to `/recipes/:id`.
5. **RecipeDetailPage** — Full recipe: hero image, metadata, ingredients list, steps, comment section with star ratings. Fetches `GET /api/recipes/:id` and `GET /api/recipes/:id/comments`. Author-only comment delete.
6. **NewRecipePage / EditRecipePage** — Multi-field form with dynamic ingredient rows (`useFieldArray`) and step list. Image upload with react-dropzone preview. Posts to `POST /api/recipes` or `PUT /api/recipes/:id`. Image uploaded first to `POST /api/upload`, then `imageUrl` included in recipe payload.
7. **CommentSection** — Flat comment list with star ratings. Comment form (textarea + star selector). `GET/POST/DELETE /api/recipes/:id/comments`.
8. **ProfilePage** — User info (avatar, name, bio) + grid of user's published RecipeCard components.

**Patterns to follow:**
- **Page-level data fetching**: Each page fetches its own data via `useEffect` + axios. State lives in the page component.
- **React Hook Form + Zod**: Define Zod schema matching backend validation. Pass `zodResolver(schema)` to `useForm`. Use `useFieldArray` for dynamic arrays (ingredients, steps).
- **API module pattern**: Each API domain has its own module in `src/api/` exporting promise-returning functions. Extend with `src/api/uploadApi.js`.
- **Sonner toast notifications**: `<Toaster position="bottom-right" richColors />` in App root. Call `toast.success()` / `toast.error()` after async operations.

**Anti-patterns to avoid:**
- Prop drilling across 3+ levels (use context or restructure)
- Inline API calls in components (use API modules)
- Controlled `<input type="file">` for image upload (use react-dropzone)
- Managing dynamic form fields with `useState` (use `useFieldArray`)

### Critical Pitfalls

1. **Tailwind v3 configuration applied to v4** — Most tutorials and LLM training data still reference v3 patterns (`tailwind.config.js`, PostCSS, `@tailwind base/components/utilities`). In v4, use only `@import "tailwindcss"` in CSS and `@tailwindcss/vite` plugin. Do NOT create config files. **Prevention:** reference only v4 docs, delete any v3 config files immediately.

2. **Dynamic form fields without useFieldArray** — Using `useState` arrays for ingredient rows and step lists causes stale closures, zombie child components, and broken validation. **Prevention:** use `useFieldArray({ control, name: 'ingredients' })` from day one. All recipe forms need it.

3. **Image upload UI without backend endpoint** — Building frontend dropzone before `POST /api/upload` exists leaves non-functional UI. **Prevention:** build the backend upload endpoint FIRST (multer, file validation, `/uploads/` storage) or in parallel. Verify with curl before building frontend UI.

4. **shadcn/ui TypeScript components in JSX project** — `npx shadcn@latest add` generates `.tsx` files but the project uses `.jsx`. Build fails on TypeScript syntax. **Prevention:** add minimal `tsconfig.json` with `allowJs: true` so `.tsx` files coexist with `.jsx`. Vite handles `.tsx` natively via esbuild.

5. **Form submission without loading state** — User clicks "Publish" and nothing happens for 2-3 seconds. **Prevention:** check `form.formState.isSubmitting` to disable button and show spinner text.

6. **Zod schema diverging from backend validation** — Frontend Zod schema and backend `validateRecipePayload` drift apart. User passes frontend validation but gets a 400 from the backend. **Prevention:** cross-reference `backend/src/controllers/recipeController.js` §`validateRecipePayload` when writing Zod schemas. Match field names, types, and constraints exactly.

## Implications for Roadmap

Based on research, the feature dependency chain, and critical pitfalls, the suggested phase structure is:

### Phase 1: Foundation & Layout Shell
**Rationale:** Everything depends on Tailwind v4 and shadcn/ui being correctly installed and configured. This phase establishes the visual foundation, routing structure, and shared components that all subsequent phases build on. Must come first because Pitfall #1 (v3 config) and Pitfall #4 (TS/JSX) are resolved here.

**Delivers:** Tailwind CSS v4 + shadcn/ui installed and configured. Base layout (Navbar with responsive hamburger, page shell). Updated routing with all page stubs. AuthProvider functioning. Sonner `<Toaster />` in root. Design tokens established (colors, typography, spacing). `tsconfig.json` added if needed for shadcn TypeScript coexistence.

**Addresses:** Foundation from FEATURES.md — Tailwind setup, shadcn/ui init, Navbar, routing, auth context.

**Avoids:** Pitfall #1 (Tailwind v3 config), Pitfall #4 (shadcn TS/JSX).

### Phase 2: Recipe Feed & Discovery
**Rationale:** The recipe feed is the landing experience and the most visible part of the application. It exercises shadcn/ui Card components, responsive grid layout, API data fetching, and filter/search patterns. Building this first validates the Tailwind + shadcn stack end-to-end with the simplest page before tackling complex forms.

**Delivers:** HomePage with recipe feed grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop). RecipeCard component (image, title, author, difficulty badge, cook time). Filter bar with category select, difficulty select, search input (debounced 300ms). URL query params for shareable filters. Loading skeleton grid. Empty state ("No recipes found").

**Addresses:** Recipe feed, RecipeCard, filtering/search, responsive design, loading states, empty states from FEATURES.md.

**Uses:** shadcn/ui Card, Badge, Input, Select, Skeleton. lucide-react icons. Pattern 1 (page-level data fetching).

### Phase 3: Recipe Detail & Interaction
**Rationale:** The detail page is the second most important view. It uses the same RecipeCard pattern for the author's other recipes, introduces comments and star ratings (the social layer), and implements the differentiators (hero image, summary bar, ingredient checklist). Depends on Phase 2 for RecipeCard reuse.

**Delivers:** RecipeDetailPage with hero image banner (full-width with overlay gradient). Metadata (title, author avatar, difficulty badge, tags, time/servings summary bar). Ingredients list with interactive checklist (local state). Steps list. CommentSection with flat comment list, star rating display, comment form (textarea + star selector). Author-only delete. Toast notifications on comment post/delete.

**Addresses:** Recipe detail page, comments with ratings, difficulty badge, ingredient checklist, hero image banner, time/servings summary bar, error/empty states from FEATURES.md.

**Avoids:** Pitfall #9 (Tailwind class conflicts with shadcn), Pitfall #10 (missing alt text).

### Phase 4: Recipe Creation & Editing
**Rationale:** Forms are the highest-complexity feature and depend on shadcn/ui Form components, RHF, and Zod all being correctly wired. The image upload requires a new backend endpoint (Pitfall #3). This phase is isolated so form complexity doesn't block the read-only pages. The backend upload endpoint must be built before or in parallel.

**Delivers:** NewRecipePage and EditRecipePage. Multi-field form with RHF + Zod validation. Dynamic ingredient rows with `useFieldArray` (name, amount, unit — add/remove). Dynamic step list with `useFieldArray`. Category and difficulty selects. Tags input. Image upload with react-dropzone (drag-and-drop zone, click-to-browse, preview thumbnail, file type/size validation). Backend `POST /api/upload` endpoint with multer. Submit button with loading state (`isSubmitting`). Toast notifications on publish/update. Redirect to detail page on success.

**Addresses:** Create/edit recipe form, image upload with preview, form validation, loading states from FEATURES.md.

**Avoids:** Pitfall #2 (useState for dynamic fields → useFieldArray), Pitfall #3 (no backend endpoint → build first), Pitfall #5 (no loading state → isSubmitting), Pitfall #6 (CORS on upload), Pitfall #7 (silent upload errors → frontend validation), Pitfall #8 (Zod diverging from backend → cross-reference validateRecipePayload).

**Uses:** shadcn/ui Form, FormField, Input, Textarea, Select, Button. react-dropzone useDropzone hook. RHF useFieldArray. Zod recipeSchema. multer (backend).

### Phase 5: Profile Page & Polish
**Rationale:** The profile page is the lowest-complexity page — it reuses RecipeCard from Phase 2 and requires minimal new logic. This phase also includes the responsive design audit, accessibility pass, and edge-case cleanup (404 page, error boundaries, loading state consistency). Placing it last means all core features are functional before the polish pass.

**Delivers:** ProfilePage with user info (avatar, name, bio) and grid of user's published RecipeCard components. Edit profile link. Responsive design audit across all pages (mobile, tablet, desktop). Accessibility pass (alt text audit, keyboard navigation, ARIA labels, focus management). Consistent loading/error/empty states across all pages. 404 page for missing recipes/routes.

**Addresses:** Profile page, responsive design polish, loading/error/empty states (all pages), accessibility from FEATURES.md.

**Avoids:** Pitfall #10 (missing alt text on images).

### Phase Ordering Rationale

The order follows the feature dependency chain from FEATURES.md:
1. Foundation must come first — every component depends on Tailwind + shadcn
2. Recipe feed is the simplest data-fetching page — validates the stack before tackling forms
3. Recipe detail reuses RecipeCard and introduces the comment/social layer
4. Forms are isolated last among features because they are the highest complexity and have the most pitfalls
5. Profile is essentially a RecipeCard grid + user info — trivial after feed exists

This ordering also groups related concerns: read-only pages (Phase 2-3) before write pages (Phase 4), and polish (Phase 5) after all features are functional.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (Recipe Creation & Editing):** Complex integration — RHF + Zod + shadcn Form + useFieldArray + react-dropzone + multer. Multiple libraries interacting. New backend endpoint. Highest pitfall density (6 of 10 pitfalls map to this phase). Needs `--research-phase` during planning.
- **Phase 1 (Foundation & Layout):** Tailwind v4 setup is well-documented but the v3→v4 pitfall is critical enough to warrant verification. shadcn/ui TS/JSX coexistence needs a decision (tsconfig.json vs. manual conversion vs. full TS migration). Research-phase recommended.

Phases with standard patterns (skip research-phase):

- **Phase 2 (Recipe Feed & Discovery):** Card grid, filtering, search — well-documented patterns. Standard React data fetching.
- **Phase 3 (Recipe Detail & Interaction):** Detail page layout, comment list — established patterns. No new libraries.
- **Phase 5 (Profile & Polish):** RecipeCard reuse, responsive audit, accessibility — standard patterns, no research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via `npm view` on 2026-06-04. Official docs consulted for every technology (Tailwind v4 Vite guide, shadcn/ui installation, RHF docs, react-dropzone docs). Version compatibility matrix confirmed. |
| Features | HIGH | Derived from PROJECT.md §Active and §Out of Scope. Feature landscape mapped against shadcn/ui component catalog and existing API endpoints. Dependencies and order verified. |
| Architecture | HIGH | Existing codebase reviewed: AuthContext.jsx, AppRouter.jsx, src/api/ pattern. All patterns compatible with new libraries. Anti-patterns identified from real-world React pitfalls. |
| Pitfalls | HIGH | Every pitfall has a specific version, file path, or code example backing it. Tailwind v4 upgrade guide consulted. RHF useFieldArray docs for stale-state bugs. Backend validateRecipePayload cross-referenced. |

**Overall confidence:** HIGH — All research backed by official documentation, existing codebase review, and npm registry verification. No significant unknowns remain.

### Gaps to Address

- **Backend upload endpoint does not exist:** `POST /api/upload` with multer must be built. The Recipe model has `imageUrl` field but no upload route. Address in Phase 4 planning — build before or in parallel with frontend upload UI. Verified: Express 4.21.0 + multer 2.1.1 are compatible.
- **shadcn/ui TypeScript/JSX coexistence:** Project uses `.jsx`. shadcn generates `.tsx`. Decision needed: minimal `tsconfig.json` with `allowJs: true` (recommended), manual type-stripping, or full TypeScript migration. Address in Phase 1 planning.
- **Backend validation alignment:** Zod schemas must match `validateRecipePayload` in `recipeController.js`. Cross-reference during form implementation in Phase 4. Minor risk of drift if backend validation is updated independently.

## Sources

### Primary (HIGH confidence)
- [Context7] `/websites/tailwindcss` — Tailwind v4 Vite installation, `@tailwindcss/vite` plugin, v4 configuration (no config files, `@import` directive)
- [Context7] `/react-hook-form/documentation` — Zod resolver integration, `useForm` API, `useFieldArray` for dynamic fields
- [Context7] `/shadcn-ui/ui` — Vite installation, Tailwind v4 compatibility, component catalog (Card, Form, Button, Input, Dialog, Tabs, Badge, Skeleton, etc.)
- [Context7] `/websites/react-dropzone_js` — `useDropzone` hook, file preview, drag-and-drop, file type/size validation
- [npm registry] — All version numbers verified via `npm view` on 2026-06-04
- [Official docs] https://tailwindcss.com/docs/installation/framework-guides/vite — Tailwind v4 Vite setup
- [Official docs] https://ui.shadcn.com/docs/installation/vite — shadcn/ui Vite installation
- [Official docs] https://tailwindcss.com/docs/upgrade-guide — v3→v4 breaking changes, migration guide
- [Official docs] https://react-hook-form.com/docs/usefieldarray — dynamic form field API
- [GitHub] https://github.com/react-hook-form/react-hook-form — RHF v7.77.0 release notes
- [GitHub] https://github.com/colinhacks/zod — Zod v3.25.x changelog, v4 status

### Secondary (MEDIUM confidence)
- Existing codebase: `AuthContext.jsx`, `AppRouter.jsx`, `src/api/` pattern — architecture patterns confirmed
- Existing backend: `backend/src/controllers/recipeController.js` §`validateRecipePayload` — validation logic to match
- Sonner docs — Toaster setup and toast API
- lucide-react docs — icon catalog and tree-shaking behavior

### Tertiary (LOW confidence)
- None — all findings backed by primary or secondary sources.

---
*Research completed: 2026-06-04*
*Ready for roadmap: yes*
