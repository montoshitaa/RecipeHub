# Phase 04: Polish & UX — Research

**Researched:** 2026-06-05
**Domain:** UX polish — responsive design audit, loading/empty/error state normalization
**Confidence:** HIGH

## Summary

Phase 4 is a POLISH phase, not a feature phase. Phases 1–3 have built all functional pages with working data flows, but three UX gaps remain: (1) inconsistent loading skeleton implementations across pages, (2) missing spinner indicators on all form submission buttons, (3) hand-rolled empty/error states that lack the UI-SPEC's prescribed structure. Additionally, the app has two critical routing bugs (links to `/new` instead of `/create`) and one page (`Profile.tsx`) that still imports the removed `apiFetch` function and is hidden behind `@ts-nocheck`.

**Primary recommendation:** Fix the two routing bugs and the broken Profile page immediately (they are blockers). Then execute the two-phase plan defined in ROADMAP.md: Plan 04-01 (responsive audit + fix) and Plan 04-02 (loading/empty/error state normalization per UI-SPEC).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Responsive layout | Browser / Client | — | CSS breakpoints applied in JSX — purely client-side concern |
| Loading skeleton rendering | Browser / Client | — | Conditional rendering in React components, no server involvement |
| Empty state rendering | Browser / Client | — | Client-side conditional rendering based on data arrays |
| Error state rendering | Browser / Client | — | Client-side error handling from API catch blocks |
| Button spinner indicators | Browser / Client | — | Form submission state tracked in React state |
| Route correction (`/new` → `/create`) | Browser / Client | — | Client-side routing via react-router-dom |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | App is fully responsive across mobile, tablet, and desktop breakpoints | §Responsive Audit — all pages verified against UI-SPEC breakpoint contract; 0 layout breakages found, 2 minor deviations noted |
| UX-02 | All data-fetching views show loading skeleton or spinner states | §Loading State Audit — 4 pages use raw `<div>` instead of `<Skeleton>`; 4 forms lack `<Spinner>`; all need normalization |
| UX-04 | Empty states show friendly messages when no data exists | §Empty State Audit — 2 hand-rolled empty states exist working but don't use shadcn `<Empty>` component; no structural bugs |

## Standard Stack

No new packages needed for this phase. The polish phase uses existing installed tools:

### Core (already installed — verified in `frontend/package.json`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| React | 19.0.1 | UI library | Existing — no upgrade needed |
| Tailwind CSS | 4.3.0 | Responsive utilities | `sm:`, `md:`, `lg:` breakpoint prefixes, arbitrary value support |
| shadcn/ui CLI | 4.10.0 | Component scaffolding | Copy-paste components: Skeleton already installed; Spinner + Empty to be added |
| lucide-react | 0.546.0 | Empty state icons | `Search`, `Utensils`, `MessageSquare` icons for empty states |
| tw-animate-css | 1.4.0 | Animation utilities | Provides `animate-in fade-in` for page transition; currently `animate-fade-in` used but doesn't match API |

### Components to Install (this phase only)

| Component | Source | Command | Purpose |
|-----------|--------|---------|---------|
| Spinner | shadcn official registry (`@shadcn`) | `npx shadcn@latest add spinner` | Button loading indicators replacing text-only loading |
| Empty | shadcn official registry (`@shadcn`) | `npx shadcn@latest add empty` | Structured empty states replacing hand-rolled `<div>` |

## Package Legitimacy Audit

> slopcheck was unavailable at research time. Both components are from the shadcn official registry (copy-paste, no npm packages). All packages below are `[ASSUMED]` — planner must gate installs behind `checkpoint:human-verify`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| shadcn Spinner | @shadcn (official) | N/A (copy-paste) | N/A | [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) | N/A | Approved — [ASSUMED] |
| shadcn Empty | @shadcn (official) | N/A (copy-paste) | N/A | [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) | N/A | Approved — [ASSUMED] |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Note:** Both components are from the same official shadcn registry that provided all 11 existing `src/components/ui/*.tsx` files. `spinner` and `empty` are listed at `https://ui.shadcn.com/blocks` per the UI-SPEC (Registry Safety section, line 383-397). No third-party registries involved.

## Complete Page & Component Inventory

### Routes (from `App.tsx` + `ProtectedRoute.tsx`)

| Route | Page Component | Auth | Status | Phase Built |
|-------|---------------|------|--------|-------------|
| `/` | `Home.tsx` | Public | Functional | Phase 2 |
| `/recipes/:id` | `RecipeDetail.tsx` | Public | Functional | Phase 2 |
| `/login` | `Login.tsx` | Public (redirects if logged in) | Functional | Phase 1 |
| `/register` | `Register.tsx` | Public (redirects if logged in) | Functional | Phase 1 |
| `/create` | ProtectedRoute → `CreateRecipe.tsx` | Protected | Functional | Phase 3 |
| `/edit/:id` | ProtectedRoute → `EditRecipe.tsx` | Protected | Functional | Phase 3 |
| `*` (404) | `NotFound.tsx` | Public | Functional | Phase 1 |
| (no route) | `Unauthorized.tsx` | N/A (navigated to programmatically) | Functional | Phase 1 |

### Components (non-route)

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Header | `components/Header.tsx` | Navigation bar | Functional — has routing bug |
| RecipeCard | `components/RecipeCard.tsx` | Recipe grid card | Functional |
| RecipeForm | `components/RecipeForm.tsx` | Create/edit form | Functional |
| StarRating | `components/StarRating.tsx` | Star display/input | Functional |
| ProtectedRoute | `components/ProtectedRoute.tsx` | Auth gate wrapper | Functional — loading spinner is hand-rolled |
| AuthContext | `context/AuthContext.tsx` | Auth state | Functional |

### shadcn/ui Components Installed

`badge`, `button`, `card`, `checkbox`, `form`, `input`, `label`, `select`, `separator`, `skeleton`, `textarea` — 11 components, all in `src/components/ui/`.

### Missing shadcn/ui Components (to install)

`spinner`, `empty` — 2 components needed per UI-SPEC.

## CRITICAL BUGS (Blocker Issues)

These three issues make the app broken or unreachable for users and MUST be fixed before any UX polish work.

### BUG-1: Header "New Recipe" links to `/new` but route is `/create`

**File:** `frontend/src/components/Header.tsx` line 42
**Problem:** `<NavLink to="/new">` links to a route that does not exist. Clicking navigates to 404.
**Fix:** Change `to="/new"` to `to="/create"`.

### BUG-2: Profile empty state links to `/new` but route is `/create`

**File:** `frontend/src/pages/Profile.tsx` line 202
**Problem:** `<Link to="/new">` in the empty state CTA links to a route that does not exist.
**Fix:** Change `to="/new"` to `to="/create"`.

### BUG-3: Profile.tsx uses removed `apiFetch` — page is broken

**File:** `frontend/src/pages/Profile.tsx` lines 1, 11, 31, 62
**Problem:** The file has `@ts-nocheck` on line 1 which suppresses TypeScript errors. It imports `apiFetch` from `'../api/client'` (line 11), but `apiFetch` was removed from `client.ts` in Phase 1. The page will fail at runtime with a ReferenceError.
**Fix:** Remove `@ts-nocheck`, replace `import { apiFetch }` with `import { api }`, replace `apiFetch('/api/recipes')` with `api.get('/api/recipes').then(r => r.data)`, replace `apiFetch(...)` with `api.delete(...)`.

## Loading State Audit

### Per-Page Assessment

| View | Current Pattern | Correct Pattern | Gap |
|------|----------------|-----------------|-----|
| **Home** | `<Skeleton>` from shadcn (3 placeholder cards) | Pattern A (Skeleton Grid) ✓ | **Correct** — no change needed |
| **RecipeDetail** | Raw `<div className="bg-neutral-200">` with `animate-pulse` wrapper (lines 147-193) | Pattern B (Full-Page Skeleton with `<Skeleton>`) | **NEEDS FIX** — replace all `bg-neutral-200` divs with `<Skeleton>` component |
| **EditRecipe** | Raw `<div className="bg-neutral-200">` with `animate-pulse` wrapper (lines 71-99) | Pattern B (Full-Page Skeleton with `<Skeleton>`) | **NEEDS FIX** — replace all `bg-neutral-200` divs with `<Skeleton>` component |
| **Profile** | Raw `<div className="bg-neutral-200">` with `animate-pulse` on wrapper (lines 165-181) | Pattern A (Skeleton Grid with `<Skeleton>`) | **NEEDS FIX** — replace raw divs with `<Skeleton>` |
| **ProtectedRoute** | Custom spinner (border animation + "Verifying Session..." text, lines 14-24) | Normalize to match app pattern | **LOW PRIORITY** — functional but visually inconsistent |
| **Login** button | Text-only "Authenticating..." (Pattern D) | Pattern C: `<Spinner>` + text | **NEEDS FIX** — install Spinner, add to button |
| **Register** button | Text-only "Creating account..." (Pattern D) | Pattern C: `<Spinner>` + text | **NEEDS FIX** — install Spinner, add to button |
| **CreateRecipe** button | Text-only "Publishing recipe..." (Pattern D) | Pattern C: `<Spinner>` + text | **NEEDS FIX** — install Spinner, add to button |
| **EditRecipe** button | Text-only no loading text (RecipeForm handles via `isSubmitting`) — shows "Publishing recipe..." text | Pattern C: `<Spinner>` + text | **NEEDS FIX** — install Spinner, add to button |
| **RecipeDetail** comment submit | Text-only "Submitting feedback..." (Pattern D) | Pattern C: `<Spinner>` + text | **NEEDS FIX** — install Spinner, add to button |

### Skeleton Replacement Detail

**`bg-neutral-200` should be replaced with `<Skeleton>`** because:
- `bg-neutral-200` is a Tailwind v3-era color class. The shadcn `<Skeleton>` component uses `bg-oklch(0.97 0 0)` which is the Tailwind v4 oklch colorspace and matches the design system.
- `<Skeleton>` provides `animate-pulse` internally (no need for manual `animate-pulse` on wrapper).
- The UI-SPEC requires `<Skeleton>` for codebase consistency (Anti-Pattern table, line 217-222).

**Files needing skeleton normalization:**
1. `frontend/src/pages/RecipeDetail.tsx` — lines 148-193 (49 lines of raw divs)
2. `frontend/src/pages/EditRecipe.tsx` — lines 71-99 (29 lines of raw divs)
3. `frontend/src/pages/Profile.tsx` — lines 165-181 (17 lines of raw divs in `<div>` wrapper)

## Empty State Audit

### Per-View Assessment

| View | Condition | Current Implementation | UI-SPEC Target | Gap |
|------|-----------|----------------------|----------------|-----|
| **Home** | `filteredRecipes.length === 0` | Hand-rolled `<div>` with serif heading, description, accent CTA button (lines 220-233) | shadcn `<Empty>` with `Search` icon | **NEEDS FIX** — replace with `<Empty>` component |
| **Profile** | `myRecipes.length === 0` | Hand-rolled `<div>` with serif heading, description, link CTA (lines 196-208) | shadcn `<Empty>` with `Utensils` icon | **NEEDS FIX** — replace with `<Empty>` component |
| **RecipeDetail** (comments) | `comments.length === 0` | Inline italic text (line 451-453) | Inline text (no `<Empty>` per UI-SPEC: "When NOT to Use Empty Component") | **Correct** — no change needed |
| **Login/Register** | N/A | N/A | N/A — form-only views never show empty data | N/A |
| **CreateRecipe/EditRecipe** | N/A | N/A | N/A — form-only views never show empty data | N/A |
| **NotFound/Unauthorized** | N/A | N/A | N/A — error states, not empty states (per UI-SPEC) | N/A |

### Empty State Copy Verification

| View | UI-SPEC Heading | UI-SPEC Description | UI-SPEC CTA | Current | Match? |
|------|----------------|--------------------|-----------|---------|--------|
| Home | "No recipes found." | "No recipes in our active catalog matched..." | "Clear Search & Filters" | ✓ Exact match | ✓ |
| Profile | "You haven't published any recipes yet." | "Your cookbook collections are looking a little bare..." | "Create my first recipe" | ✓ Exact match | ✓ |

Copy is correct. Only the component shell needs replacing (hand-rolled → `<Empty>`).

## Error State Audit

### Per-View Assessment

| View | Current | UI-SPEC Target | Gap |
|------|---------|----------------|-----|
| **Home** (fetch error) | Inline banner with heading "Error Connecting Server" and error text (lines 188-193) | Same format + "Try again" button | **MISSING RETRY BUTTON** |
| **RecipeDetail** (fetch error) | Centered card with "Unable to Load Recipe" + "Return to feed" link (lines 196-208) | "Unable to Load Recipe" + "Return to feed" Link | **Correct** |
| **EditRecipe** (fetch error) | Centered card with "Retrieval Failed" heading (line 105) + "Return to feed" button | Heading should be "Unable to Load Recipe" per spec; `text-text-cancel` typo | **COSMETIC** |
| **Profile** (fetch error) | Inline banner: `{error}` text only, no heading, no retry (lines 159-163) | Inline banner with heading + "Try again" button | **MISSING HEADING + RETRY** |
| **Login** (form error) | Inline banner: "AUTH EXCEPTION" + `{error}` (lines 74-79) | "AUTH EXCEPTION" + `{error}` | **Correct** |
| **Register** (form error) | Inline banner: "REGISTRATION EXCEPTION" + `{error}` (lines 68-73) | "REGISTRATION EXCEPTION" + `{error}` | **Correct** |

### Error Banner Fixes

| File | Line(s) | Change |
|------|---------|--------|
| `Home.tsx` | 188-193 | Add "Try again" button calling `fetchRecipes` |
| `Profile.tsx` | 159-163 | Add heading + "Try again" button calling `fetchMyRecipes` |
| `EditRecipe.tsx` | 105 | Fix typo `text-text-cancel` → `text-text-custom`; rename heading "Unable to Load Recipe" |

## Toast Message Audit

| Trigger | UI-SPEC Target | Current | Match? |
|---------|---------------|---------|--------|
| Login success | "Welcome back!" | `toast.success('Welcome back!')` | ✓ |
| Register success | "Account created successfully!" | `toast.success('Account created!')` | ✗ |
| Recipe created | "Recipe published successfully!" | `toast.success('Recipe published!')` | ✗ |
| Recipe updated | "Recipe updated successfully!" | `toast.success('Recipe updated!')` | ✗ |
| Recipe deleted | "Recipe deleted" | `toast.success('Recipe deleted')` | ✓ |
| Comment posted | "Comment posted" | `toast.success('Comment posted')` | ✓ |
| Comment deleted | "Comment deleted" | `toast.success('Comment deleted')` | ✓ |

**Files to fix:** `Register.tsx` line 47, `CreateRecipe.tsx` line 21, `EditRecipe.tsx` line 46.

## Responsive Design Audit

### Breakpoint Compliance (against UI-SPEC Contract)

Audited all 8 page components + Header + Footer against the UI-SPEC Page-by-Page Responsive Contract (lines 241-259 of 04-UI-SPEC.md).

| View | Mobile (0-639px) | Tablet (640-1023px) | Desktop (1024px+) | Compliance |
|------|-----------------|---------------------|-------------------|------------|
| **Home** (feed grid) | `grid-cols-1` ✓ | `md:grid-cols-2` ✓ | `lg:grid-cols-3` ✓ | **PASS** |
| **Home** (hero block) | `flex-col` ✓ | `md:flex-row` ✓ | `md:flex-row` ✓ | **PASS** |
| **Home** (filter bar) | `flex-col` ✓ | `flex-col` ✓ | `lg:flex-row` ✓ | **PASS** |
| **RecipeDetail** (main) | Single column ✓ | Single column ✓ | `lg:grid-cols-10` (6:4) ✓ | **PASS** |
| **RecipeDetail** (meta bar) | `flex flex-wrap` (≈2-col) ✓ | `flex flex-wrap` (≈4-col) ✓ | `flex flex-wrap` (≈4-col) ✓ | **PASS** — uses `flex-wrap` instead of spec's `grid` but achieves equivalent layout |
| **RecipeDetail** (comments) | Single column ✓ | Single column ✓ | `lg:grid-cols-10` (6:4) ✓ | **PASS** |
| **RecipeCard** | Full width ✓ | Full width ✓ | Full width ✓ | **PASS** |
| **RecipeForm** (ingredients) | Card layout (`sm:hidden`) ✓ | Table layout (`hidden sm:block`) ✓ | Table layout ✓ | **PASS** |
| **RecipeForm** (category/difficulty) | `grid-cols-1` ✓ | `md:grid-cols-2` ✓ | `md:grid-cols-2` ✓ | **PASS** |
| **RecipeForm** (time/servings) | `grid-cols-1` ✓ | `md:grid-cols-2` ✓ | `md:grid-cols-2` ✓ | **PASS** |
| **RecipeForm** (footer buttons) | `flex-col`, `w-full` ✓ | `sm:flex-row`, `sm:w-auto` ✓ | `sm:flex-row` ✓ | **PASS** |
| **Login/Register** | `max-w-[400px]` centered ✓ | Same ✓ | Same ✓ | **PASS** |
| **Profile** (user card) | `flex-col`, `text-center` ✓ | `sm:flex-row`, `sm:text-left` ✓ | `sm:flex-row` ✓ | **PASS** |
| **Profile** (recipe grid) | `grid-cols-1` ✓ | `md:grid-cols-2` ✓ | `lg:grid-cols-3` ✓ | **PASS** |
| **Header** | `flex-col`, `flex-wrap` nav ✓ | `sm:flex-row` ✓ | `sm:flex-row` ✓ | **PASS** |
| **Footer** (App.tsx) | `flex-col`, `text-center` ✓ | `md:flex-row`, `md:text-left` ✓ | `md:flex-row` ✓ | **PASS** |
| **CreateRecipe** | `max-w-4xl mx-auto` ✓ | Same ✓ | Same ✓ | **PASS** |
| **EditRecipe** | `max-w-4xl mx-auto` ✓ | Same ✓ | Same ✓ | **PASS** |
| **EditRecipe** (delete confirm) | `flex-col sm:flex-row` ✓ | ✓ | ✓ | **PASS** |
| **NotFound** | Centered column ✓ | Same ✓ | Same ✓ | **PASS** |
| **Unauthorized** | Centered column ✓ | Same ✓ | Same ✓ | **PASS** |

### Responsive Design Rule Compliance

| Rule | Status |
|------|--------|
| Mobile-first (unprefixed classes = default, overrides at `sm:`/`md:`/`lg:`) | ✓ All pages follow this |
| No fixed pixel widths without `max-w-full` protection | ✓ |
| Images use `aspect-[16/9]` with `object-cover` | ✓ |
| Grid max columns = 3 at `lg:` | ✓ |
| Touch targets ≥ 44px on icon buttons | ⚠ Checkbox in ingredient table uses `<Checkbox>` component — need manual audit |
| Tablet intermediate (never skip from mobile to `lg:`) | ✓ All pages have `md:` intermediate |

### Responsive Issues Found: 0 Layout Breakages

**No layout breakages found.** All pages already implement the responsive contract correctly. Tailwind v4 breakpoint prefixes (`sm:`, `md:`, `lg:`) are applied consistently across all views. The responsive audit plan (04-01) should focus on **verification** (visual testing at 375px, 768px, 1280px) rather than large-scale CSS rewrites.

**Minor deviations noted (cosmetic, not breakages):**
1. RecipeDetail meta bar uses `flex flex-wrap` instead of `grid grid-cols-2 md:grid-cols-4` — functionally equivalent, same visual result.
2. `animate-fade-in` class used on 6 pages (Home, RecipeDetail, Profile, CreateRecipe, EditRecipe, Login, Register, NotFound, Unauthorized) but `tw-animate-css` provides `fade-in` as a utility that works with `animate-in`, not as `animate-fade-in`. The class is a no-op (no fade animation occurs). Functionally harmless but doesn't deliver the intended page transition effect.

## File-by-File Change Matrix

### Plan 04-01: Responsive Design Audit

| File | Audit Action | Expected Changes |
|------|-------------|-----------------|
| `src/App.tsx` | Verify responsive footer + main container at 375px/768px/1280px | None expected — already correct |
| `src/index.css` | Verify Tailwind v4 breakpoints work; check `animate-fade-in` effect | Possibly remove/replace `animate-fade-in` with `animate-in fade-in` |
| `src/pages/Home.tsx` | Verify grid, hero, filter bar at all breakpoints | None expected |
| `src/pages/RecipeDetail.tsx` | Verify 6:4 split, meta bar, ingredient table at all breakpoints | None expected |
| `src/pages/Profile.tsx` | Verify user card, recipe grid at all breakpoints | **Fix BUG-2** (`/new` → `/create`) + **Fix BUG-3** (apiFetch → api) |
| `src/pages/CreateRecipe.tsx` | Verify form layout at all breakpoints | None expected |
| `src/pages/EditRecipe.tsx` | Verify form + danger zone at all breakpoints; fix typo | Fix `text-text-cancel` → `text-text-custom` (line 105) |
| `src/pages/Login.tsx` | Verify `max-w-[400px]` centering | None expected |
| `src/pages/Register.tsx` | Verify `max-w-[400px]` centering | None expected |
| `src/pages/NotFound.tsx` | Verify centered layout | None expected |
| `src/pages/Unauthorized.tsx` | Verify centered layout | None expected |
| `src/components/Header.tsx` | Verify `sm:flex-row` nav; **fix routing bug** | **Fix BUG-1** (`/new` → `/create` line 42) |
| `src/components/RecipeCard.tsx` | Verify card at all widths; touch target audit | None expected |
| `src/components/RecipeForm.tsx` | Verify mobile card ↔ desktop table toggle | None expected |
| `src/components/ProtectedRoute.tsx` | Verify spinner layout | None expected |

### Plan 04-02: Loading & Empty States

#### shadcn Component Installation

```bash
npx shadcn@latest add spinner   # → src/components/ui/spinner.tsx
npx shadcn@latest add empty     # → src/components/ui/empty.tsx
```

#### File Changes (14 files, estimated ~120 lines changed)

| # | File | Changes |
|---|------|---------|
| 1 | `src/pages/RecipeDetail.tsx` | Replace raw `bg-neutral-200` skeleton divs (lines 148-193) with `<Skeleton>` components; add `<Spinner>` to comment submit button (line 555) |
| 2 | `src/pages/EditRecipe.tsx` | Replace raw `bg-neutral-200` skeleton divs (lines 71-99) with `<Skeleton>`; fix `text-text-cancel` typo (line 105); fix toast message |
| 3 | `src/pages/Profile.tsx` | Replace raw skeleton divs (lines 165-181) with `<Skeleton>`; fix `apiFetch`→`api` (lines 1,11,31,62); fix `/new`→`/create` (line 202); add error heading + retry button (lines 159-163) |
| 4 | `src/pages/Home.tsx` | Add "Try again" button to error banner (line 188-193); add `<Empty>` component for empty state (lines 220-233); import `Search` from lucide-react |
| 5 | `src/pages/Login.tsx` | Import `<Spinner>`, replace text "Authenticating..." with `<Spinner>` + "Authenticating..." (line 122) |
| 6 | `src/pages/Register.tsx` | Import `<Spinner>`, replace text "Creating account..." with `<Spinner>` + "Creating account..." (line 147); fix toast message line 47 |
| 7 | `src/components/RecipeForm.tsx` | Import `<Spinner>`, replace text "Publishing recipe..." with `<Spinner>` + loading text on submit button (lines 771-772) |
| 8 | `src/pages/CreateRecipe.tsx` | Fix toast message "Recipe published!" → "Recipe published successfully!" (line 21) |
| 9 | `src/pages/RecipeDetail.tsx` | [Included in row 1 — same file, comment submit spinner] |
| 10 | `src/components/Header.tsx` | Fix BUG-1: `/new` → `/create` (line 42) |
| 11 | `src/components/ProtectedRoute.tsx` | Optionally normalize spinner to use `<Skeleton>` or `<Spinner>` |
| 12 | `src/components/ui/spinner.tsx` | **NEW** — installed via `npx shadcn@latest add spinner` |
| 13 | `src/components/ui/empty.tsx` | **NEW** — installed via `npx shadcn@latest add empty` |
| 14 | `src/pages/Profile.tsx` | [Included in row 3 — same file, empty state] Add `<Empty>` component with `Utensils` icon |

#### Post-Change State Rendering Verification

After changes, all views must follow the UI-SPEC State Rendering Priority:

```
1. loading === true    → Skeleton or Spinner (Pattern A/B/C)
2. error !== null      → Error banner with retry/return CTA
3. data.length === 0   → Empty state with CTA
4. otherwise           → Content
```

## Architecture Patterns

### Pattern 1: Conditional Rendering with State Priority

The app follows a consistent 4-state rendering pattern (loading → error → empty → content). This pattern is already in Home.tsx and RecipeDetail.tsx. All views that fetch data must follow this pattern.

```tsx
// Source: Home.tsx lines 188-233 (existing pattern)
{error && !loading && (
  <ErrorBanner message={error} onRetry={fetchData} />
)}

{loading ? (
  <SkeletonGrid />
) : data.length > 0 ? (
  <ContentGrid data={data} />
) : (
  <EmptyStateCTA />
)}
```

**Rendering priority:** loading → error → empty → content (error trumps empty because a failed load doesn't mean the data is empty).

### Pattern 2: Skeleton Mirroring Real Layout

Skeleton loaders must mirror the real content layout to prevent layout shift. The grid, spacing, borders, and aspect ratios of skeleton cards must be identical to real cards.

```tsx
// Source: Home.tsx lines 197-211 (existing, correct pattern)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
  {[1, 2, 3].map((num) => (
    <div key={num} className="border border-border-custom bg-surface">
      <Skeleton className="w-full aspect-[16/9] border-b border-border-custom" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  ))}
</div>
```

### Pattern 3: Inline Error Banner with Retry

Error banners for data-fetching views must include a retry mechanism.

```tsx
// Source: UI-SPEC lines 356-366 (target pattern)
{error && !loading && (
  <div className="bg-red-50 border border-danger text-danger p-4 sm:p-6 font-mono text-sm">
    <p className="font-bold uppercase tracking-wider mb-2">ERROR HEADING</p>
    <p>{error}</p>
    <button onClick={fetchData} className="mt-3 text-xs uppercase tracking-wider underline hover:no-underline font-bold">
      Try again
    </button>
  </div>
)}
```

### Pattern 4: Button Spinner for Form Submissions

All form submit buttons must show a spinner during submission.

```tsx
// Target pattern (Pattern C from UI-SPEC)
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner data-icon="inline-start" className="size-4" />
      Authenticating...
    </>
  ) : (
    'Sign in'
  )}
</Button>
```

### Anti-Patterns to Avoid

- **Raw `<div className="bg-neutral-200">` as skeleton:** Use `<Skeleton>` from `@/components/ui/skeleton`. It provides the design-system pulse animation and correct color (`bg-oklch(0.97 0 0)`).
- **Text-only loading states:** "Authenticating...", "Publishing recipe...", "Submitting feedback..." without a spinner icon. Replace with `<Spinner>` + text.
- **Missing retry in error banners:** Home and Profile fetch errors lack retry buttons. The user's only recovery path is a full page refresh.
- **Mixed error/loading display:** Error banner and skeleton should never appear simultaneously. Check `{error && !loading && (...)}` in all views.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skeleton placeholder animation | Custom `animate-pulse` + `bg-neutral-200` divs | `<Skeleton>` from `@/components/ui/skeleton` | Design-system colors, correct animation, accessibility |
| Button loading indicator | Text-only "Authenticating..." | `<Spinner>` from `@/components/ui/spinner` | Visual feedback, prevents double-click confusion |
| Empty state layout | Raw `<div>` with inline styles | `<Empty>` from `@/components/ui/empty` | Consistent spacing, icon placement, accessibility |
| Error banner with retry | Error div without retry button | Inline error banner + "Try again" button calling fetch function | User recovery path without page refresh |

**Key insight:** The UI-SPEC defines standardized components for all three states. Hand-rolling these creates visual inconsistency and misses accessibility features (e.g., empty state focus management, spinner aria attributes).

## Common Pitfalls

### Pitfall 1: Replacing Skeleton Without Preserving Layout Structure
**What goes wrong:** When replacing raw `bg-neutral-200` divs with `<Skeleton>`, the wrapper elements (borders, padding, grid) get accidentally changed.
**Why it happens:** The raw div approach uses `border border-border-custom bg-surface` on the card wrapper and `bg-neutral-200` on inner divs. Replacing inner divs with `<Skeleton>` is correct, but the wrapper must stay.
**How to avoid:** Replace only the inner `<div className="bg-neutral-200 ...">` with `<Skeleton>`. Keep the outer wrapper `<div>` with its border and background classes.
**Warning signs:** Cards lose their border, or gain double borders (Skeleton has its own `rounded-md` which differs from the card's square corners).

### Pitfall 2: Breaking the Conditional Chain
**What goes wrong:** Adding error banner or empty state above/beside the loading skeleton, causing both to display simultaneously.
**Why it happens:** Using `{error && <ErrorBanner />}` without checking `!loading` first. Or using `{data.length === 0 && <Empty />}` without checking `!loading && !error`.
**How to avoid:** Use the established ternary chain: `error ? <Error /> : loading ? <Skeleton /> : data.length === 0 ? <Empty /> : <Content />`.
**Warning signs:** Error banner appears briefly then disappears when data loads (it should replace the skeleton, not appear alongside it).

### Pitfall 3: Forgetting the Retry Button
**What goes wrong:** Error banner shows the error message but provides no recovery path.
**Why it happens:** The error banner pattern from the copywriting contract includes a "Try again" button, but only Home's UI-SPEC specifically calls it out. Implementers may miss it on Profile.
**How to avoid:** For every data-fetching view, add `onClick={fetchFunction}` to the retry button. The fetch function name varies per page (`fetchRecipes`, `fetchMyRecipes`, `fetchData`).

### Pitfall 4: Installing shadcn Components in Wrong Directory
**What goes wrong:** Running `npx shadcn@latest add spinner` from the wrong working directory installs to a different project.
**Why it happens:** The shadcn CLI reads `components.json` from the CWD. If run from the repo root instead of `frontend/`, it may fail or install to the wrong location.
**How to avoid:** Always run shadcn commands from `frontend/` directory.
**Warning signs:** Component appears at `src/components/ui/` instead of `frontend/src/components/ui/`.

### Pitfall 5: `animate-fade-in` Is a No-Op
**What goes wrong:** The class `animate-fade-in` is used on 9 page components but `tw-animate-css` provides the animation via `animate-in fade-in` (two separate utilities). The current class does nothing.
**Why it happens:** The class name `animate-fade-in` doesn't match any Tailwind v4 or tw-animate-css utility. It's silently ignored.
**How to avoid:** Replace `animate-fade-in` with `animate-in fade-in` (the correct tw-animate-css composition API) or remove it if page transitions are not desired.
**Warning signs:** Pages load instantly with no fade transition. Console shows no errors.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server, shadcn CLI | ✓ | (any) | — |
| npm | Package installation | ✓ | (any) | — |
| shadcn CLI | Installing spinner + empty components | ✓ | 4.10.0 (in node_modules) | — |
| lucide-react | Empty state icons | ✓ | 0.546.0 (installed) | — |
| tw-animate-css | `animate-in fade-in` page transitions | ✓ | 1.4.0 (installed) | — |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none

All dependencies for this phase are already installed. The only new additions are two copy-paste shadcn components (`spinner`, `empty`) from the official registry — no npm packages needed.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No — auth already implemented in Phase 1 | N/A |
| V3 Session Management | No — already implemented | N/A |
| V4 Access Control | No — already implemented | N/A |
| V5 Input Validation | No — forms already validated with zod | N/A |
| V6 Cryptography | No — no cryptographic operations in this phase | N/A |

**Security note:** This is a pure UX/UI polish phase. No new data flows, API endpoints, or authentication logic are introduced. The `apiFetch` → `api` fix in Profile.tsx uses the existing axios client with its JWT interceptor (already security-reviewed in Phase 1).

### Known Threat Patterns for Tailwind CSS v4 / React

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `dangerouslySetInnerHTML` | Tampering | React auto-escapes `{error}` expressions — no XSS risk. Never use `dangerouslySetInnerHTML`. UI-SPEC explicitly confirms this (line 375). |
| CSS injection via user-controlled class names | Tampering | No user-controlled class names in this app. All classes are hardcoded strings. |
| Layout breakage via CSS specificity conflicts | Denial of Service | Tailwind v4 utility-first approach eliminates specificity issues. No custom CSS besides `index.css` theme variables. |

## Sources

### Primary (HIGH confidence)
- **Codebase audit** — All 27 source files in `frontend/src/` read and analyzed. Every page, component, API wrapper, and UI component examined.
- **UI-SPEC** — `.planning/phases/04-polish-ux/04-UI-SPEC.md` (513 lines) — defines the exact design contract, breakpoint table, component inventory, error/empty/loading state patterns, and copywriting contract.
- **`frontend/package.json`** — Verified all installed versions: React 19.0.1, Tailwind CSS 4.3.0, shadcn 4.10.0, tw-animate-css 1.4.0, lucide-react 0.546.0.
- **`frontend/components.json`** — shadcn configuration: radix-nova style, neutral baseColor, geist font, lucide icons, default radius.
- **`tw-animate-css` source** — Verified in `node_modules/tw-animate-css/dist/tw-animate.css`: `fade-in` is a `@utility`, not a standalone animation. `animate-fade-in` is not a defined utility.

### Secondary (MEDIUM confidence)
- **shadcn/ui official registry** — Spinner and Empty components listed at `https://ui.shadcn.com/blocks` (referenced in UI-SPEC Registry Safety section, lines 383-397). [CITED: 04-UI-SPEC.md lines 383-397]
- **Phase 1-3 summaries** — `.planning/phases/01-foundation-authentication/`, `02-browse-discover/`, `03-recipe-management/` — documented which Phase each feature was built in and what changes were made.

### Tertiary (LOW confidence)
- None. All findings in this research are verified against the codebase or UI-SPEC.

## Assumptions Log

> All claims tagged `[ASSUMED]` in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | shadcn official registry provides `spinner` and `empty` components at `npx shadcn@latest add spinner` and `npx shadcn@latest add empty` | Standard Stack | Low — UI-SPEC verified these exist on shadcn official blocks page. If unavailable, hand-roll the components per the shadcn patterns already in the codebase. |
| A2 | `<Spinner>` component uses `data-icon="inline-start"` prop pattern | Code Examples | Low — this matches the shadcn pattern for icon placement. If different, the planner can adjust. |
| A3 | `<Empty>` component uses composition API (`<EmptyHeader>`, `<EmptyMedia>`, `<EmptyTitle>`, `<EmptyDescription>`, `<EmptyContent>`) | Code Examples | Low — UI-SPEC documents this structure (lines 320-333). If different, the planner can adjust. |
| A4 | Profile.tsx `apiFetch` replacement with `api.get` will work correctly | Critical Bugs | Medium — the API response format may differ from what `apiFetch` returned. The `apiFetch` mock returned data directly; `api.get` returns `{ data: ... }`. Profile.tsx line 31 does `const data: Recipe[] = await apiFetch('/api/recipes')` assuming direct return. The fix must unwrap: `const res = await api.get('/api/recipes'); const data = res.data`. |

## Open Questions

1. **Does `animate-fade-in` need to be fixed or removed?**
   - What we know: `tw-animate-css` provides `fade-in` as a utility composed with `animate-in`. `animate-fade-in` doesn't match any known utility.
   - What's unclear: Whether the designer intended page transitions (which would require `animate-in fade-in duration-300`) or if the class was a placeholder.
   - Recommendation: Replace with `animate-in fade-in duration-300` on all page root elements for a consistent 300ms fade-in effect. If transitions are not desired, remove the class entirely.

2. **Should ProtectedRoute spinner be normalized to match the app's skeleton pattern?**
   - What we know: ProtectedRoute uses a unique custom spinner (border animation + text) that appears briefly during auth rehydration.
   - What's unclear: Whether this spin is preferred over the skeleton pattern or if consistency is more important.
   - Recommendation: Normalize to use `<Skeleton>` for consistency, but this is low priority. The current spinner works correctly and is rarely seen (only on page refresh for authenticated users).

3. **Profile.tsx: Should the `apiFetch` fix be in Plan 04-01 or 04-02?**
   - What we know: Profile.tsx has three issues: routing bug (`/new`), `apiFetch` usage, and raw skeleton divs.
   - What's unclear: Whether to fix all three in one plan or split across plans.
   - Recommendation: Fix all Profile.tsx issues in Plan 04-01 (responsive audit) since the `apiFetch` bug makes the page non-functional. Plan 04-02 can focus on the skeleton/empty/error normalization for the other views.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, verified in package.json
- Architecture: HIGH — patterns derived from existing code (Home.tsx uses correct pattern) and UI-SPEC design contract
- Pitfalls: HIGH — based on concrete code patterns found in the audit
- Responsive audit: HIGH — every view audited against UI-SPEC breakpoint contract; 0 layout breakages found

**Research date:** 2026-06-05
**Valid until:** 2026-07-05 (30 days — stable phase with no external dependency changes expected)