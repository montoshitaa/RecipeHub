# Phase 4: Polish & UX - Research

**Researched:** 2026-06-05
**Domain:** Frontend responsive design audit, loading/empty/error state consistency, Tailwind CSS v4 responsive breakpoints, shadcn/ui skeleton/spinner/empty component patterns
**Confidence:** HIGH

## Summary

Phase 4 is a polish/audit phase — no new features, just responsive fixes and UX state consistency across all views built in Phases 1–3. The codebase already has partial implementations of loading skeletons, empty states, and error states, but they are inconsistent: some pages use hardcoded `<div>` placeholders instead of shadcn `<Skeleton>`, some loading states are missing entirely (Login/Register forms), and the responsive layout strategy varies between pages. The shadcn/ui `Spinner` and `Empty` components are not yet installed.

The Tailwind v4 breakpoint system is mobile-first with five default breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px). The existing codebase already uses responsive grid patterns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) and flex patterns (`flex-col sm:flex-row`) across most views. The audit needs to systematically verify every page at the three target breakpoints and fix any remaining hardcoded widths, overflow issues, or missing responsive variants.

**Primary recommendation:** Split into two sequential plans — 04-01 (responsive audit across all 7 data-fetching pages + header/footer) and 04-02 (standardize loading/empty/error states: install shadcn Spinner + Empty components, normalize skeleton patterns, add missing states to Login/Register/CreateRecipe, verify all 8 views have consistent state handling).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | App is fully responsive across mobile, tablet, and desktop breakpoints | Tailwind v4 breakpoint audit pattern (§Responsive Audit Approach); 7 pages identified needing verification |
| UX-02 | All data-fetching views show loading skeleton or spinner states | shadcn Skeleton/Spinner patterns (§Loading State Patterns); 6 views need loading states |
| UX-04 | Empty states show friendly messages when no data exists | shadcn Empty component pattern + current state audit (§Empty State Patterns); 3 views need empty states |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Responsive layout (grids, flex, spacing) | Browser / Client | — | Tailwind CSS utility classes applied directly in component JSX; no server-side rendering needed |
| Loading skeleton states | Browser / Client | — | Client-side UI pattern; rendered in React while awaiting API responses |
| Empty state messages | Browser / Client | — | UI-only concern; conditional rendering based on empty data arrays |
| Error state handling | Browser / Client | API / Backend | Error messages originate from API; client displays them safely via React (auto-escapes HTML) |
| Spinner indicators | Browser / Client | — | shadcn Spinner component using lucide-react LoaderIcon; client-side only |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS v4 | 4.3.0 | Responsive utility classes, breakpoint prefixes | Already installed via `@tailwindcss/vite`; no config file needed; mobile-first responsive design is a built-in primitive [VERIFIED: tailwindcss.com/docs/responsive-design] |
| shadcn/ui Skeleton | N/A (copy-paste) | Loading placeholder component | Already installed; used inconsistently — some pages use it, others use raw `<div>` placeholders [VERIFIED: ui.shadcn.com/docs/components/skeleton] |
| shadcn/ui Spinner | N/A (needs install) | Animated loading indicator (spinner) | Not yet installed; needed for inline button loading states (Login/Register forms) and small-area loading [VERIFIED: ui.shadcn.com/docs/components/spinner] |
| shadcn/ui Empty | N/A (needs install) | Structured empty state component | Not yet installed; provides consistent Empty→EmptyHeader→EmptyTitle→EmptyDescription→EmptyContent composition API for all empty states [VERIFIED: ui.shadcn.com/docs/components/empty] |
| lucide-react | 0.546.0 | Icon library (LoaderIcon for Spinner) | Already installed; Spinner component uses `LoaderIcon` from lucide-react [CITED: ui.shadcn.com/docs/components/spinner] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast notifications for error states | Already installed; use for non-blocking error feedback (API failures, network errors) alongside inline error banners |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Spinner | Custom CSS animation spinner | Reinventing the wheel; shadcn Spinner is already accessible (role="status", aria-label), respects theme, and integrates with Button/Badge via `data-icon` |
| shadcn Empty | Hand-rolled empty state divs | Current code already hand-rolls empty states; shadcn Empty provides consistent structure, accessibility, and theming across all views |
| Raw `<div>` skeleton loaders | shadcn Skeleton | Raw divs need manual `bg-neutral-200 animate-pulse` classes; shadcn Skeleton provides consistent styling, rounded corners, and dark mode support out of the box |

**Installation (new components only — no npm packages):**
```bash
# Add shadcn/ui components needed for this phase
npx shadcn@latest add spinner   # Inline loading indicator
npx shadcn@latest add empty     # Structured empty state
```

## Package Legitimacy Audit

> **Result:** No new npm packages are installed in this phase. Both `spinner` and `empty` are shadcn/ui copy-paste components (added via `npx shadcn add`) — they copy source files into `src/components/ui/` rather than installing npm packages. slopcheck audit skipped (no external packages).

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| *(none — shadcn copy-paste only)* | — | — | — | — | — | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Current State Audit

### Views Inventory (from Phases 1–3)

| # | View | Route | Data-Fetching | Current Loading | Current Empty | Current Error |
|---|------|-------|---------------|-----------------|---------------|---------------|
| 1 | Home | `/` | Yes (recipes feed) | ✅ Skeleton grid (3 cards, uses shadcn Skeleton + raw divs) | ✅ "No recipes found" + Clear Filters CTA | ✅ Red error banner |
| 2 | RecipeDetail | `/recipes/:id` | Yes (recipe + comments) | ✅ Full-page skeleton layout (raw `bg-neutral-200` divs) | ✅ Comments: "No feedback comments left yet" | ✅ Error card + Return CTA |
| 3 | CreateRecipe | `/create` | No (form post only) | ❌ **Missing** — no loading indicator beyond button text "Publishing recipe..." | N/A (form, not list) | ✅ Top error banner + toast |
| 4 | EditRecipe | `/edit/:id` | Yes (load existing recipe) | ✅ Form skeleton (raw divs) | N/A (form, not list) | ✅ Error card + Return CTA |
| 5 | Login | `/login` | No (form post only) | ❌ **Missing** — button shows "Authenticating..." text only | N/A (form) | ✅ Inline error banner |
| 6 | Register | `/register` | No (form post only) | ❌ **Missing** — button shows "Creating account..." text only | N/A (form) | ✅ Inline error banner |
| 7 | Profile | `/profile` | Yes (user recipes) | ✅ Skeleton grid (3 cards, raw divs) | ✅ "You haven't published any recipes yet" + CTA | ✅ Red error banner |
| 8 | NotFound | `*` | No (static) | N/A | N/A | N/A (is itself an error state) |
| 9 | Unauthorized | (redirect only) | No (static) | N/A | N/A | N/A (is itself an error state) |
| – | Header | (global) | No | N/A | N/A | N/A |
| – | Footer | (global) | No | N/A | N/A | N/A |

### Key Findings
- **3 views missing loading states:** CreateRecipe, Login, Register have no visual loading feedback beyond button text changes. This violates UX-02 ("no blank screens").
- **Inconsistent skeleton patterns:** Home uses a mix of shadcn `<Skeleton>` and raw `<div>` placeholders; RecipeDetail, EditRecipe, and Profile use entirely raw `<div className="bg-neutral-200">` patterns. The shadcn Skeleton component exists but is underutilized.
- **Empty states are partially covered:** Home, RecipeDetail (comments), and Profile have empty state messages. No empty states are needed for form-only views (Login, Register, CreateRecipe, EditRecipe) since they don't display lists.
- **Error states are well-covered:** All data-fetching views already display error messages. The axios 401 interceptor in `api/client.ts` handles session expiry by redirecting to `/login`.

## Responsive Audit Approach

### Tailwind v4 Responsive Breakpoints

Default breakpoints (mobile-first) — from official docs [VERIFIED: tailwindcss.com/docs/responsive-design]:

| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| *(unprefixed)* | 0px (all screens) | Mobile |
| `sm:` | 640px (40rem) | Large phone / small tablet portrait |
| `md:` | 768px (48rem) | Tablet portrait |
| `lg:` | 1024px (64rem) | Tablet landscape / small desktop |
| `xl:` | 1280px (80rem) | Desktop |
| `2xl:` | 1536px (96rem) | Large desktop |

### Systematic Audit Procedure

For each view, verify at three target resolutions per success criteria:

```
1. Mobile (375px – iPhone SE):  1-column layout
2. Tablet (768px – iPad):        2-column layout where applicable
3. Desktop (1280px+):            3-column grid or wider layouts
```

**Checklist per view:**
1. No horizontal overflow (check `overflow-x-hidden` or missing `max-w-full` on images)
2. Grid columns transition correctly at breakpoints (`grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3`)
3. Flex layouts stack vertically on mobile (`flex-col` → `sm:flex-row`)
4. Text sizes scale appropriately (`text-2xl sm:text-3xl lg:text-4xl`)
5. Padding/margins adjust (`p-4 sm:p-6 lg:p-8`)
6. Navigation is usable at all sizes (Header wraps gracefully, links are tappable)
7. Form inputs and buttons are full-width on mobile, auto-width on desktop
8. Images maintain aspect ratio with `aspect-[16/9]` or similar
9. No fixed pixel widths that break at smaller viewports (look for `w-[400px]` etc.)
10. Tables/wide content (ingredients table) have horizontal scroll or stack on mobile

### Current Responsive State by View

| View | Mobile (1-col) | Tablet (2-col) | Desktop (3-col) | Issues Noted |
|------|----------------|----------------|-----------------|--------------|
| Home (feed grid) | ✅ `grid-cols-1` | ✅ `md:grid-cols-2` | ✅ `lg:grid-cols-3` | Filter bar: horizontal on `lg:`, stacked below (needs verification at `md:`) |
| Home (hero block) | ✅ `flex-col` | ✅ `md:flex-row` | ✅ `md:flex-row` | Minor: catalog count `<br>` only shown at `md:` |
| RecipeDetail (main layout) | ✅ Single col | ✅ Single col | ✅ `lg:grid-cols-10` with 6/4 split | Left/right columns split at `lg:` only; tablet gets single column |
| RecipeDetail (comments) | ✅ Single col | ✅ Single col | ✅ `lg:grid-cols-10` split | Same as above |
| RecipeDetail (meta bar) | `grid-cols-2` | `md:grid-cols-4` | `md:grid-cols-4` | May be tight on 375px with 2-col grid |
| RecipeForm (ingredients) | ✅ Card layout (`sm:hidden`) | ✅ Table layout (`hidden sm:block`) | ✅ Table | Mobile cards need verification for long ingredient names |
| RecipeForm (category/diff) | ✅ `grid-cols-1` | ✅ `md:grid-cols-2` | ✅ `md:grid-cols-2` | — |
| RecipeForm (time/servings) | ✅ `grid-cols-1` | ✅ `md:grid-cols-2` | ✅ `md:grid-cols-2` | — |
| Login/Register | ✅ `max-w-[400px]` centered | ✅ Same | ✅ Same | Fixed max-width is fine (auth forms are narrow by design) |
| Profile (user card) | ✅ `flex-col` | ✅ `sm:flex-row` | ✅ `sm:flex-row` | Text alignment: `text-center sm:text-left` |
| Profile (recipe grid) | ✅ `grid-cols-1` | ✅ `md:grid-cols-2` | ✅ `lg:grid-cols-3` | — |
| EditRecipe (form skeleton) | ✅ Single col | `md:grid-cols-2` for some fields | Same as tablet | — |
| Header | ✅ `flex-col` | ✅ `sm:flex-row` | ✅ `sm:flex-row` | Nav wraps with `flex-wrap`; user greeting hidden on mobile (`hidden sm:flex`) |
| Footer | ✅ `flex-col` | ✅ `md:flex-row` | ✅ `md:flex-row` | Text center on mobile (`text-center md:text-left`) |
| NotFound / Unauthorized | ✅ Centered vertically | ✅ Same | ✅ Same | Already well-behaved at all sizes |

### Responsive Design Patterns to Enforce

**Primary pattern (mobile-first grid):**
```tsx
// Standard recipe card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
```

**Primary pattern (mobile-first flex):**
```tsx
// Stack on mobile, row on tablet+
<div className="flex flex-col sm:flex-row items-start gap-4">
```

**Tailwind v4 `max-*` variant for breakpoint ranges:**
```tsx
// Apply only between md and lg breakpoints
<div className="md:max-lg:grid-cols-2">
```
[CITED: tailwindcss.com/docs/responsive-design#targeting-a-breakpoint-range]

### Potential Responsive Issues to Audit

1. **Image overflow:** RecipeDetail hero image uses `max-h-[360px]` with `aspect-[16/9]` — verify this doesn't cause overflow on narrow screens.
2. **Ingredients table on mobile:** RecipeForm has `sm:hidden` (cards) and `hidden sm:block` (table) — verify cards render correctly for long ingredient names with many characters.
3. **Filter bar wrapping:** Home filter uses `flex-col lg:flex-row` — on tablet (md:), it stacks but may need explicit handling.
4. **Button groups on narrow screens:** RecipeDetail edit/delete buttons in top bar — verify they don't overflow on 375px width.
5. **Star rating component:** Interactive stars at `text-2xl` on `lg` size — verify tappable targets are large enough on mobile.
6. **RecipeForm footer buttons:** Uses `flex-col sm:flex-row` with `w-full sm:w-auto` — already responsive but verify at exact breakpoint.
7. **No `overflow-x-auto` on wide content:** The profile and home grids don't have horizontal scroll protection — if a card gets too wide, it could cause page overflow.

## Loading State Patterns

### Existing shadcn Skeleton (already installed)

The shadcn Skeleton component is installed at `src/components/ui/skeleton.tsx`:
```tsx
// Source: ui.shadcn.com/docs/components/skeleton [VERIFIED]
import { Skeleton } from "@/components/ui/skeleton"
<Skeleton className="h-[20px] w-[100px] rounded-full" />
```

It applies `animate-pulse rounded-md bg-oklch(0.97 0 0)` by default.

### shadcn Spinner (needs installation)

The Spinner component wraps lucide-react's `LoaderIcon` with `animate-spin` [VERIFIED: ui.shadcn.com/docs/components/spinner]:
```tsx
// After: npx shadcn@latest add spinner
import { Spinner } from "@/components/ui/spinner"
<Spinner /> // Default: size-4, animate-spin
<Spinner className="size-6" /> // Larger
```

### Pattern 1: Skeleton Grid (Card Feed Loading)

**Where:** Home feed, Profile recipe grid
**Current state:** Home uses a mix of shadcn `<Skeleton>` and raw `<div>`; Profile uses raw `<div>` only.
**Target pattern:**
```tsx
// Consistent skeleton grid using shadcn Skeleton component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
  {Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="border border-border-custom bg-surface">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <div className="border-t border-border-custom pt-3 flex justify-between">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/5" />
        </div>
      </div>
    </div>
  ))}
</div>
```

### Pattern 2: Full-Page Skeleton (Detail/Edit Loading)

**Where:** RecipeDetail, EditRecipe (already have skeletons but use raw divs)
**Target pattern:**
```tsx
// Page-level skeleton with consistent Skeleton usage
<div className="space-y-6 animate-pulse">
  <div className="border border-border-custom bg-surface p-6 space-y-4">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
    <div className="lg:col-span-6 space-y-4">
      <Skeleton className="w-full aspect-[16/9]" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="lg:col-span-4 space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
</div>
```

### Pattern 3: Button/Inline Spinner (Form Submission Loading)

**Where:** Login, Register, CreateRecipe submit buttons
**Target pattern:**
```tsx
// Source: ui.shadcn.com/docs/components/spinner [VERIFIED]
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner data-icon="inline-start" />
      Authenticating...
    </>
  ) : (
    "Sign in"
  )}
</Button>
```

### Pattern 4: Form Section Skeleton (EditRecipe form load)

**Where:** EditRecipe (already has, needs Skeleton normalization)
**Target pattern:**
```tsx
// Form fields skeleton during initial load
<div className="max-w-4xl mx-auto space-y-6">
  <div className="border border-border-custom bg-surface p-6 sm:p-8 space-y-4">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
  </div>
  <div className="border border-border-custom bg-surface p-8 space-y-8">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
</div>
```

### Loading State Coverage Map

| View | Current State | Action Needed |
|------|--------------|---------------|
| Home (feed) | Mixed Skeleton + raw divs | Normalize to all `<Skeleton>` |
| RecipeDetail | Raw `bg-neutral-200` divs | Replace with `<Skeleton>` |
| EditRecipe | Raw `bg-neutral-200` divs | Replace with `<Skeleton>` |
| Profile (recipe grid) | Raw `bg-neutral-200` divs | Replace with `<Skeleton>` |
| Login | **Missing entirely** | Add `<Spinner>` in submit button |
| Register | **Missing entirely** | Add `<Spinner>` in submit button |
| CreateRecipe | **Missing entirely** | Add `<Spinner>` in submit button |

## Empty State Patterns

### Existing Empty States

The codebase currently hand-rolls empty states with raw `<div>` markup. Only 3 of 7 data-fetching views have empty states:

| View | Has Empty State? | Message Quality | Has CTA? |
|------|-----------------|-----------------|----------|
| Home (no recipes match filters) | ✅ | Good: "No recipes found." | ✅ Clear Filters button |
| RecipeDetail (no comments) | ✅ | Good: "No feedback comments left yet." | ❌ No CTA (acceptable — users must be authenticated to comment, and there's a sign-in prompt above) |
| Profile (no user recipes) | ✅ | Good: "You haven't published any recipes yet." | ✅ "Create my first recipe" link |
| CreateRecipe | N/A (form page) | — | — |
| EditRecipe | N/A (form page) | — | — |
| Login | N/A (form page) | — | — |
| Register | N/A (form page) | — | — |

### shadcn Empty Component (needs installation)

The shadcn Empty component provides a structured composition API [VERIFIED: ui.shadcn.com/docs/components/empty]:
```tsx
// After: npx shadcn@latest add empty
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Utensils size={32} />
    </EmptyMedia>
    <EmptyTitle>No recipes found</EmptyTitle>
    <EmptyDescription>
      No recipes in our active catalog matched your currently selected filters.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button onClick={handleClearFilters}>Clear Search & Filters</Button>
  </EmptyContent>
</Empty>
```

### Recommendation: shadcn Empty vs. Hand-Rolled

**Use shadcn Empty for:** empty states that are the primary content of a view (Home empty filter results, Profile empty recipes, RecipeDetail empty comments). These benefit from consistent structure and accessibility.

**Keep hand-rolled for:** simple inline messages where the full composition API is overkill (e.g., a one-line "No comments yet" text). The existing `RecipeDetail` empty comments message works fine as-is.

**Decision:** Convert the three existing empty states (Home, Profile, RecipeDetail comments) to use shadcn Empty component for visual consistency, while keeping the simple inline approach as an option for minor empty states.

### Empty State Message Guidelines

| View | Empty Condition | Title | Description | CTA |
|------|----------------|-------|-------------|-----|
| Home | `filteredRecipes.length === 0` after API success | "No recipes found" | "No recipes in our catalog matched your search or filter criteria. Try adjusting your parameters." | "Clear Search & Filters" button |
| Profile | `myRecipes.length === 0` | "No recipes yet" | "Your cookbook is looking a little bare. Share your first signature recipe with the community." | "Create my first recipe" link → `/create` |
| RecipeDetail | `comments.length === 0` | "No reviews yet" | "Be the first to share your experience making this recipe." | None (authentication gate — users must sign in) |

## Error State Patterns

### Current Error Handling Assessment

All data-fetching views already implement error states. The axios response interceptor in `api/client.ts` handles 401 globally (clears token + redirects to `/login`). Individual catch blocks display error messages.

| View | Error Display | Toast? | CTA? |
|------|--------------|--------|------|
| Home | Red banner with message | ❌ No toast | ❌ No CTA (just message) |
| RecipeDetail | Error card + "Return to feed" link | ❌ No toast | ✅ Return CTA |
| EditRecipe | Error card + "Return to feed" button | ❌ No toast | ✅ Return CTA |
| Profile | Red banner | ❌ No toast | ❌ No CTA |
| Login | Red banner "AUTH EXCEPTION" | ❌ No toast | ❌ No CTA (form still usable) |
| Register | Red banner "REGISTRATION EXCEPTION" | ❌ No toast | ❌ No CTA (form still usable) |
| CreateRecipe | RecipeForm top error banner | ✅ toast.error() on submit failure | ❌ No CTA (form still usable) |

### Error Handling Patterns to Standardize

**Pattern 1: Inline Error Banner (data-fetching views)**
```tsx
{error && !loading && (
  <div className="bg-red-50 border border-danger text-danger p-5 font-mono text-sm">
    <p className="font-bold uppercase tracking-wider mb-2">Error Loading Data</p>
    <p>{error}</p>
    <button onClick={retry} className="mt-3 underline text-xs uppercase">
      Try again
    </button>
  </div>
)}
```

**Pattern 2: Toast + Inline Error (form submissions)**
```tsx
// Already standard! CreateRecipe and RecipeForm use this pattern:
catch (err) {
  toast.error(err?.response?.data?.message || 'Failed to create recipe');
  throw err; // bubbles to form for inline error banner
}
```

**Pattern 3: Network/Connection Error Recovery**
```tsx
// Add retry capability to Home and Profile error states
const fetchData = async () => { /* existing logic */ };
// In error banner: <button onClick={fetchData}>Try again</button>
```

### Error State Coverage Assessment

**Well-covered:** All views display errors. The axios 401 interceptor handles global auth expiry. Toast notifications fire for mutation failures (create/edit/delete/comment).

**Gaps to fix:**
1. Home error banner has no retry button — user must refresh page to retry
2. Profile error banner has no retry button — same issue
3. RecipeDetail error state could benefit from a "Retry" button alongside "Return to feed"
4. No offline detection — if the browser is offline, axios errors show generic messages

## Architecture Patterns

### System Architecture Diagram

```
User Resize / Page Load / API Call
         │
         ▼
┌──────────────────────────────────────────────────┐
│                  React Components                 │
│                                                  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Responsive   │  │ Loading  │  │  Empty/    │  │
│  │ Layout       │  │ State    │  │  Error     │  │
│  │ (Tailwind    │  │ (Skeleton│  │  State     │  │
│  │  breakpoint  │  │  Spinner)│  │  (Empty/   │  │
│  │  prefixes)   │  │          │  │  Banner)   │  │
│  └──────┬───────┘  └────┬─────┘  └─────┬──────┘  │
│         │               │               │        │
│         ▼               ▼               ▼        │
│  ┌──────────────────────────────────────────┐    │
│  │         State-Driven Rendering           │    │
│  │  if (loading) → Skeleton/Spinner         │    │
│  │  if (error) → Error Banner + Retry       │    │
│  │  if (data.length === 0) → Empty State    │    │
│  │  else → Content                          │    │
│  └──────────────────┬───────────────────────┘    │
└─────────────────────┼────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│              API Layer (axios)                    │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  │
│  │ /api/recipes│  │/api/auth  │  │/api/comments│  │
│  └─────┬──────┘  └─────┬─────┘  └──────┬─────┘  │
│        │               │               │        │
│        ▼               ▼               ▼        │
│  ┌──────────────────────────────────────────┐    │
│  │    401 Interceptor → Clear token,        │    │
│  │    redirect to /login                    │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### Recommended Project Structure (Post-Phase)

```
src/
├── components/
│   ├── ui/
│   │   ├── skeleton.tsx       # Already exists — normalize usage
│   │   ├── spinner.tsx         # NEW — npx shadcn add spinner
│   │   ├── empty.tsx           # NEW — npx shadcn add empty
│   │   └── ... (button, badge, card, etc.)
│   ├── Header.tsx
│   ├── RecipeCard.tsx
│   ├── RecipeForm.tsx
│   └── StarRating.tsx
├── pages/
│   ├── Home.tsx                # Normalize Skeleton, add retry to error
│   ├── RecipeDetail.tsx        # Normalize Skeleton, add Empty to comments
│   ├── CreateRecipe.tsx        # Add Spinner to button
│   ├── EditRecipe.tsx          # Normalize Skeleton
│   ├── Login.tsx               # Add Spinner to button
│   ├── Register.tsx            # Add Spinner to button
│   ├── Profile.tsx             # Normalize Skeleton, add retry to error, add Empty
│   ├── NotFound.tsx            # N/A — already static
│   └── Unauthorized.tsx        # N/A — already static
├── api/
│   ├── client.ts              # 401 interceptor (existing)
│   ├── auth.ts
│   └── recipes.ts
└── context/
    └── AuthContext.tsx
```

### Anti-Patterns to Avoid

- **Raw `<div>` as skeleton:** Using `<div className="bg-neutral-200 animate-pulse">` instead of `<Skeleton>`. This becomes inconsistent when Skeleton's base styles change (e.g., dark mode needs different colors). Use `<Skeleton>` everywhere.
- **Silent loading (no indicator):** Login/Register forms currently have no visual feedback beyond button text. Users on slow connections see a frozen button and may click multiple times. Always show a `<Spinner>` or disabled state.
- **Mixed responsive strategies:** Some pages use `md:` breakpoints for tablet, others use `lg:`. The current approach is generally correct (mobile-first, progressive enhancement) but the audit should verify consistency — particularly that tablet layouts aren't skipped (some views go directly from mobile to `lg:`).
- **Fixed-width containers without `max-w-full`:** Hardcoded `w-[400px]` will overflow on 375px screens unless wrapped with responsive utilities or `max-w-full`.
- **Tailwind v4 `border-border-custom` vs `border-border`:** The project defines both — `border-custom` (from `@theme`) and `border` (from shadcn `:root` variables). Some components use one, others use the other. The responsive audit doesn't need to fix this, but it's a consistency note.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading skeleton placeholders | Custom `<div>` with `bg-neutral-200 animate-pulse` | `<Skeleton>` from shadcn/ui | Already installed; handles dark mode, rounded corners, consistent animation; raw divs become inconsistent across pages |
| Inline loading spinner | Custom CSS `@keyframes spin` animation | `<Spinner>` from shadcn/ui | Accessible out of the box (`role="status"`, `aria-label="Loading"`); integrates with Button via `data-icon`; uses lucide-react LoaderIcon which is already installed |
| Empty state UI | Hand-rolled `<div>` with custom layout | `<Empty>` + `<EmptyHeader>` + `<EmptyTitle>` + `<EmptyDescription>` + `<EmptyContent>` from shadcn/ui | Consistent visual structure; supports media (icons, avatars); accessible; themable; already used in shadcn ecosystem |
| Responsive breakpoint logic | JavaScript `window.innerWidth` event listeners | Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) | Zero JS overhead; co-located with styles; handles resize automatically; already the project's standard approach |
| Error retry logic | Custom `useEffect` retry timers | Simple `<button onClick={refetch}>` in error banner | Avoids complexity; user-controlled retry is better UX than automatic polling; consistent with existing patterns |

**Key insight:** The project already has the right tools installed (Skeleton, Tailwind breakpoints, sonner toasts). The polish phase is about **consistent application**, not new tooling. The only additions are the Spinner and Empty shadcn components, which are copy-paste (not npm packages) and follow the same pattern as existing `src/components/ui/*` files.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Mobile-First Confusion
**What goes wrong:** Developer adds `sm:text-center` expecting it to center text on mobile screens. It actually centers text on screens *640px and wider*, not on mobile. [VERIFIED: tailwindcss.com/docs/responsive-design#targeting-mobile-screens]
**Why it happens:** Tailwind is mobile-first — unprefixed utilities apply to ALL screens; prefixed utilities apply at that breakpoint AND ABOVE.
**How to avoid:** Always start with the mobile layout (unprefixed classes), then add breakpoint overrides. Think: "default = mobile, sm: = tablet+, md: = desktop+".
**Warning signs:** Text looks correct on desktop but wrong on mobile; grid shows desktop layout on tablet.

### Pitfall 2: Skipping Tablet Breakpoint
**What goes wrong:** View works on mobile and desktop, but on iPad-sized screens (768px–1024px), elements overflow or overlap because the layout jumps directly from `flex-col` (mobile) to `lg:flex-row` (desktop) with no `md:` intermediate state.
**Why it happens:** Developer tests at phone size and full desktop, forgets the 768px–1024px tablet range.
**How to avoid:** Audit every page at 768px width. If the mobile layout looks stretched or the desktop layout is cramped, add an `md:` intermediate layout.
**Warning signs:** RecipeDetail uses `lg:grid-cols-10` split — at `md:` (tablet), it's single column. This is probably fine for readability but verify. Home filter bar uses `flex-col lg:flex-row` — on tablet the stacked filters may look awkward.

### Pitfall 3: Skeleton vs. Real Content Layout Mismatch
**What goes wrong:** Loading skeleton has different dimensions or structure than the real content, causing a layout shift when data loads (Cumulative Layout Shift / CLS).
**Why it happens:** Skeleton is built independently from the real component, and they drift apart over time as the real component is modified.
**How to avoid:** Skeletons should mirror the exact structure of the loaded content — same grid, same padding, same aspect ratios. The current code already does this well (Home skeleton has same `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` as the loaded grid).
**Warning signs:** Content "jumps" when loading finishes; skeleton cards are different heights than real cards.

### Pitfall 4: Missing Error State Recovery
**What goes wrong:** Error banner displays but user has no way to retry — they must refresh the entire page.
**Why it happens:** Error states are added as an afterthought without considering the recovery UX.
**How to avoid:** Every error banner for data-fetching views should include a "Try again" button that re-triggers the fetch function.
**Warning signs:** Home and Profile error banners have no retry button — user is stuck.

### Pitfall 5: shadcn Spinner Without Accessible Label
**What goes wrong:** Spinner is visually present but screen readers don't announce the loading state.
**Why it happens:** Developer imports Spinner but doesn't add `aria-label` context.
**How to avoid:** The shadcn Spinner already has `role="status"` and `aria-label="Loading"` built in [VERIFIED: ui.shadcn.com/docs/components/spinner]. No extra work needed — just use the component as-is.
**Warning signs:** Spinner with no accessible name in accessibility audits.

## Code Examples

### Responsive Grid with Skeleton Loading (Home Pattern)

```tsx
// Source: Verified against current Home.tsx codebase + shadcn Skeleton docs [VERIFIED]
import { Skeleton } from '@/components/ui/skeleton';

// Loading state
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {[1, 2, 3].map((num) => (
      <div key={num} className="border border-border-custom bg-surface">
        <Skeleton className="w-full aspect-[16/9] rounded-none border-b border-border-custom" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <div className="border-t border-border-custom pt-3 flex justify-between">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/5" />
          </div>
        </div>
      </div>
    ))}
  </div>
) : /* loaded content */}
```

### Form Button with Spinner (Login/Register Pattern)

```tsx
// Source: shadcn Spinner docs [VERIFIED: ui.shadcn.com/docs/components/spinner]
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

<Button
  type="submit"
  disabled={isSubmitting}
  className="w-full ... cursor-pointer disabled:opacity-50 disabled:cursor-wait"
>
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

### Empty State with shadcn Empty (Profile Pattern)

```tsx
// Source: shadcn Empty docs [VERIFIED: ui.shadcn.com/docs/components/empty]
import { Utensils, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

{myRecipes.length === 0 && !loading && !error && (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Utensils size={32} className="text-text-muted" />
      </EmptyMedia>
      <EmptyTitle>No recipes yet</EmptyTitle>
      <EmptyDescription>
        Your cookbook is looking a little bare. Share your first signature recipe
        with the RecipeHub community.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Link
        to="/create"
        className="btn-primary bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 inline-flex items-center gap-2"
      >
        <span>Create my first recipe</span>
        <ArrowRight size={14} />
      </Link>
    </EmptyContent>
  </Empty>
)}
```

### Error State with Retry (Home/Profile Pattern)

```tsx
{error && !loading && (
  <div className="bg-red-50 border border-danger text-danger p-5 font-mono text-sm">
    <p className="font-bold uppercase tracking-wider mb-2">Error Loading Data</p>
    <p>{error}</p>
    <button
      onClick={fetchRecipes}
      className="mt-3 text-xs uppercase tracking-wider underline hover:no-underline font-bold"
    >
      Try again
    </button>
  </div>
)}
```

### Responsive Flex Layout (Header/Form Pattern)

```tsx
// Source: Tailwind v4 responsive design docs [VERIFIED]
// Mobile: stacked; Tablet+: horizontal row
<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
  <div>Left content</div>
  <div className="flex gap-2">
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw `<div>` skeleton loaders (`bg-neutral-200 animate-pulse`) | shadcn `<Skeleton>` component with `animate-pulse` + theme-aware colors | Now (this phase) | Dark mode compatibility; consistent rounded corners; single source of truth for skeleton styling |
| Button text-only loading ("Authenticating...") | `<Spinner>` icon + text in disabled Button | Now (this phase) | Visual loading feedback; prevents double-submit; accessible via `role="status"` |
| Hand-rolled empty state divs | shadcn `<Empty>` composition API | Now (this phase) | Consistent structure; icon/media support; accessibility; theming |
| No retry on error | "Try again" button in error banners | Now (this phase) | Better UX; users aren't forced to refresh the page |
| Tailwind v3 PostCSS config | Tailwind v4 `@tailwindcss/vite` plugin + CSS `@theme` | Phase 1 (already done) | No config file; CSS-based customization; container queries available |

**Deprecated/outdated:**
- **Raw `<div>` skeleton loaders:** Replace with `<Skeleton>` throughout. The raw div pattern doesn't benefit from centralized theme updates and dark mode.
- **Button text-only loading indicators:** Replace with `<Spinner>` for visual feedback.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | shadcn Spinner component installs correctly via `npx shadcn@latest add spinner` in the existing project configuration | Standard Stack | Low — shadcn add is a well-tested CLI; fallback is manual copy-paste of the Spinner code from docs |
| A2 | shadcn Empty component installs correctly via `npx shadcn@latest add empty` | Standard Stack | Low — same as above; fallback is manual copy-paste |
| A3 | Tailwind v4 `max-*` breakpoint range variants (e.g., `md:max-lg:`) are available in v4.3.0 | Responsive Audit Approach | Low — verified in official Tailwind v4.3 docs (web fetched) |
| A4 | No existing views need structural refactoring — only class-level responsive fixes | Current State Audit | Medium — if any view has fundamental layout issues (e.g., CSS grid with fixed column counts that can't be made responsive), the scope of 04-01 expands |
| A5 | The `@theme` CSS variables (`--color-*`, `--font-*`) in `index.css` are correctly configured for all breakpoints | Responsive Audit Approach | Low — these are global variables, not breakpoint-specific |

## Open Questions

1. **Should the recipe card grid expand to 4 columns at `xl:` (1280px+) or `2xl:` (1536px+)?**
   - What we know: Current grid maxes at 3 columns at `lg:`. On 1440px+ displays, cards could be wider than ideal.
   - What's unclear: Whether the design intent is max-3-column or whether 4 columns at larger breakpoints is desired.
   - Recommendation: Keep 3 columns as max (current behavior). This is a safe default; 4-column recipe grids can make cards too narrow. If stakeholders want wider layouts, add `xl:grid-cols-4` as a one-line change.

2. **Should the shadcn Empty component replace ALL empty states, or keep the simpler inline message for minor cases?**
   - What we know: The current comment empty state is a one-liner (`"No feedback comments left yet"`). The Empty component adds more visual weight.
   - What's unclear: Whether the design calls for consistent visual weight across all empty states or allows lighter-weight messages in secondary areas.
   - Recommendation: Use shadcn Empty for primary empty states (Home feed, Profile recipes, RecipeDetail comments). Keep simple inline messages only where the Empty component would feel visually heavy (e.g., a sub-section within a page that already has content). Default to Empty for consistency.

3. **Should error states include automatic retry (polling) or only manual retry buttons?**
   - What we know: Phase requirements don't specify retry behavior. Current code has no retry mechanism.
   - What's unclear: Whether automatic retry is desired (adds complexity, may hammer the API).
   - Recommendation: Manual retry only (a "Try again" button). This is simpler, user-controlled, and avoids cascading API failure loops.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | v24.15.0 | — |
| npm | Package management | ✓ | 11.12.1 | — |
| shadcn CLI | Adding Spinner + Empty components | ✓ | 4.10.0 | Manual copy-paste from shadcn docs |
| Vite dev server | Development/testing | ✓ | 6.2.3 (via npm) | — |
| Git | Version control | ✓ | 2.54.0 | — |

**Missing dependencies with no fallback:** None
**Missing dependencies with fallback:** None

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Already implemented in Phase 1; this phase doesn't modify auth logic |
| V3 Session Management | No | Already implemented; 401 interceptor handles session expiry |
| V4 Access Control | No | Already implemented; ProtectedRoute handles route gating |
| V5 Input Validation | Yes (tangentially) | Error message display: React auto-escapes JSX expressions, so API error messages rendered as `{error}` are safe from XSS. No `dangerouslySetInnerHTML` is used in error displays. |
| V6 Cryptography | No | No cryptographic operations in this UI polish phase |

### Known Threat Patterns for React 19 + Tailwind v4 + shadcn/ui

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via API error messages rendered as HTML | Information Disclosure / Tampering | React escapes `{error}` by default — no `dangerouslySetInnerHTML` used in any error display [VERIFIED: codebase audit] |
| Clickjacking on retry/CTA buttons in error/empty states | Spoofing | Standard — no iframe content; app is top-level. Buttons use standard `<button>` and `<Link>` elements |
| CSS injection via Tailwind arbitrary values | Tampering | Tailwind v4 arbitrary values (e.g., `w-[${userInput}]`) are not used for user-controlled values in this codebase; all classes are static strings |

## Sources

### Primary (HIGH confidence)
- [Official docs] https://tailwindcss.com/docs/responsive-design — Tailwind v4.3 responsive breakpoints, mobile-first approach, `max-*` variants [WebFetch verified 2026-06-05]
- [Official docs] https://ui.shadcn.com/docs/components/skeleton — shadcn Skeleton component API, usage patterns, examples [WebFetch verified 2026-06-05]
- [Official docs] https://ui.shadcn.com/docs/components/spinner — shadcn Spinner component API, installation, Button integration [WebFetch verified 2026-06-05]
- [Official docs] https://ui.shadcn.com/docs/components/empty — shadcn Empty component composition API, installation, examples [WebFetch verified 2026-06-05]
- [Codebase audit] `/Users/quesadx/github/RecipeHub/frontend/src/` — Complete review of all 9 pages, 4 components, API layer, types, and CSS [Verified 2026-06-05]

### Secondary (MEDIUM confidence)
- [AGENTS.md] Current stack constraints, shadcn/ui policy (copy-paste, not npm), React 19 + Tailwind v4 + Vite 6 [Project file]
- [STACK.md in AGENTS.md] Version compatibility table, verified package versions [Project file]

### Tertiary (LOW confidence)
- None — all critical findings verified against official docs or codebase audit

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — shadcn Skeleton/Spinner/Empty are well-documented components; Tailwind v4 responsive breakpoints are stable and verified against official docs
- Architecture: HIGH — all views audited in the codebase; state coverage mapped for all 9 pages
- Pitfalls: HIGH — Tailwind v4 mobile-first pitfall verified against official docs; skeleton/CLS, error recovery, and breakpoint-skipping patterns identified from codebase review
- Responsive audit: MEDIUM-HIGH — all views analyzed for responsive classes; only unknown is whether runtime testing reveals overflow issues not visible in static class analysis

**Research date:** 2026-06-05
**Valid until:** 2026-07-05 (30 days — Tailwind v4 and shadcn/ui are stable, unlikely to change)

**Plan structure recommendation:**
- **04-01:** Responsive audit (touches all pages for layout classes only). Can be done as a systematic checklist across 7 views.
- **04-02:** Loading/Empty/Error states (installs Spinner + Empty, normalizes Skeleton usage, adds missing states). Touches 6 views for content changes.
- **Sequential execution recommended** — 04-01 makes layout fixes that affect component structure; 04-02 then normalizes the UX states within those fixed layouts.
