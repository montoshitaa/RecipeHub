---
phase: 04-polish-ux
plan: 02
subsystem: ui
tags: [shadcn/ui, skeleton, spinner, empty, loading, error, UX, Tailwind v4]

# Dependency graph
requires:
  - phase: 04-polish-ux
    provides: Critical bug fixes and data integrity corrections (04-01 PLAN)
provides:
  - Standardized skeleton loading using shadcn Skeleton component across all data-fetching views
  - Spinner button indicators on all form submit buttons (Login, Register, RecipeForm, comment)
  - shadcn Empty composition component for Home and Profile empty states
  - Error banner retry buttons for data-fetching views (Home, Profile)
affects: [future UI work, verifier UAT checks]

# Tech tracking
tech-stack:
  added:
    - "shadcn/ui Spinner component (via npx shadcn@latest add spinner)"
    - "shadcn/ui Empty component (via npx shadcn@latest add empty)"
  patterns:
    - "Pattern A: Skeleton Grid — Skeleton component in card-grid layout with border/bg-surface wrappers"
    - "Pattern B: Full-Page Skeleton — Skeleton component mirroring two-column detail layout"
    - "Pattern C: Button Spinner — Spinner + text in disabled Button during form submission"
    - "Empty composition API — Empty > EmptyHeader > EmptyMedia + EmptyTitle + EmptyDescription > EmptyContent"
    - "Error retry pattern — Inline banner with heading + error text + 'Try again' button calling fetch function"

key-files:
  created:
    - frontend/src/components/ui/spinner.tsx — Inline loading indicator (Loader2Icon with animate-spin)
    - frontend/src/components/ui/empty.tsx — Structured empty state composition (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent)
  modified:
    - frontend/src/pages/RecipeDetail.tsx — Skeleton loading block, Spinner on comment submit
    - frontend/src/pages/EditRecipe.tsx — Skeleton loading block
    - frontend/src/pages/Profile.tsx — Skeleton grid, error banner with retry, Empty component
    - frontend/src/pages/Home.tsx — Empty component, error retry button
    - frontend/src/pages/Login.tsx — Spinner on submit button
    - frontend/src/pages/Register.tsx — Spinner on submit button
    - frontend/src/components/RecipeForm.tsx — Context-aware Spinner on submit button
    - frontend/src/components/ProtectedRoute.tsx — Standardized Spinner loading indicator

key-decisions:
  - "Used shadcn official registry (@shadcn) for spinner and empty — no third-party registries"
  - "Match existing per-file import patterns (some @/components, some ../components) for consistency"
  - "RecipeForm shows context-aware submit text: 'Publishing recipe...' for create, 'Updating recipe...' for edit"

patterns-established:
  - "Pattern A (Skeleton Grid): Skeleton component with card wrapper, aspect-[16/9] image, sized text skeletons — Home, Profile"
  - "Pattern B (Full-Page Skeleton): Skeleton component mirroring real layout with border/bg-surface containers — RecipeDetail, EditRecipe"
  - "Pattern C (Button Spinner): <Spinner data-icon=\"inline-start\" className=\"size-4\" /> + text in disabled Button"
  - "Empty State: <Empty> with <EmptyHeader> + <EmptyMedia variant=\"icon\"> + <EmptyTitle> + <EmptyDescription> + <EmptyContent>"
  - "Error Retry: Inline banner with heading + error text + 'Try again' button calling data-fetching function"

requirements-completed: [UX-02, UX-04]

# Metrics
duration: 7 min
completed: 2026-06-06
---

# Phase 4 Plan 02: Loading, Empty & Error State Normalization Summary

**All data-fetching views use standardized Skeleton loaders, all form submit buttons show Spinner icons, all empty states use shadcn Empty composition, and data-fetching error banners include retry buttons — 10 files updated across 3 tasks.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-06T02:18:35Z
- **Completed:** 2026-06-06T02:26:09Z
- **Tasks:** 3
- **Files modified:** 10 (2 created, 8 modified)

## Accomplishments

- Installed two new shadcn components (Spinner, Empty) from official @shadcn registry
- Replaced all raw `bg-neutral-200` skeleton divs with shadcn `<Skeleton>` component across RecipeDetail, EditRecipe, and Profile
- Added `<Spinner>` icons to all 6 form submit buttons: Login, Register, RecipeForm (context-aware creating/updating text), RecipeDetail comments, ProtectedRoute
- Replaced hand-rolled empty state divs in Home and Profile with shadcn `<Empty>` composition component (Search and Utensils lucide icons)
- Added "Try again" retry buttons to Home and Profile error banners, plus "Error Loading Recipes" heading on Profile

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn spinner + empty Components** — `9a47ed8` (feat)
2. **Task 2: Normalize All Loading States — Skeleton + Button Spinner** — `a996a30` (feat)
3. **Task 3: Normalize Empty States + Error Retry Buttons** — `003bbf8` (feat)

## Files Created/Modified

- `frontend/src/components/ui/spinner.tsx` — Spinner component (Loader2Icon + animate-spin) — **created**
- `frontend/src/components/ui/empty.tsx` — Empty composition components (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent) — **created**
- `frontend/src/pages/RecipeDetail.tsx` — Skeleton full-page loader (Pattern B) + Spinner on comment submit button
- `frontend/src/pages/EditRecipe.tsx` — Skeleton full-page loader (Pattern B)
- `frontend/src/pages/Profile.tsx` — Skeleton grid (Pattern A) + Empty component (Utensils icon) + error banner heading + retry button
- `frontend/src/pages/Home.tsx` — Empty component (Search icon) + error banner retry button
- `frontend/src/pages/Login.tsx` — Spinner on submit button (Part C)
- `frontend/src/pages/Register.tsx` — Spinner on submit button (Part C)
- `frontend/src/components/RecipeForm.tsx` — Context-aware Spinner on submit button (Publishing/Updating text) (Part C)
- `frontend/src/components/ProtectedRoute.tsx` — Standardized Spinner loading indicator (replaced custom border spinner)

## Decisions Made

None — followed plan exactly as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `import * as React` to new shadcn components**
- **Found during:** Task 1 (Install spinner + empty)
- **Issue:** The shadcn CLI v4 output omits `import * as React from "react"`, but the project's existing shadcn components (skeleton, button, card, badge, etc.) all include it. Without it, `React.ComponentProps<T>` type annotations fail TypeScript compilation (`TS2503: Cannot find namespace 'React'`).
- **Fix:** Added `import * as React from "react"` as the first line in both `spinner.tsx` and `empty.tsx`, matching the existing project convention.
- **Files modified:** `frontend/src/components/ui/spinner.tsx`, `frontend/src/components/ui/empty.tsx`
- **Verification:** `npx tsc --noEmit` passes with zero errors.
- **Committed in:** `9a47ed8` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal — import addition was necessary for project consistency. No scope change.

## Issues Encountered

None — all tasks executed smoothly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 10 plan files modified; 2 new shadcn components installed
- `npx tsc --noEmit` passes with zero errors across all modified files
- Phase 04-polish-ux loading/empty/error state normalization is complete
- Ready for verification (UX-02: loading states ✓, UX-04: empty/error states ✓)

---
*Phase: 04-polish-ux*
*Completed: 2026-06-06*

## Self-Check: PASSED

All key-files exist on disk. All 3 task commits (9a47ed8, a996a30, 003bbf8) found in git log. TypeScript compiles with zero errors.