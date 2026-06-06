---
phase: 03-recipe-management
plan: 03
subsystem: ui
tags: [react, typescript, sonner, axios, recipe-edit, recipe-delete]

# Dependency graph
requires:
  - phase: 03-01
    provides: "RecipeForm with initialData prop, createRecipe API wrapper, ProtectedRoute, sonner toast pattern"
provides:
  - "updateRecipe API wrapper with time↔cookTimeMin field mapping"
  - "deleteRecipe API wrapper matching deleteComment void-return pattern"
  - "EditRecipe page with auth guard, pre-populated form, Danger Zone delete confirmation"
  - "Upgraded RecipeDetail delete handler using wrapper + sonner toast"
  - "/edit/:id protected route in App.tsx"
affects: [browse-discover (detail page delete), auth (protected route)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "API wrapper pattern: updateRecipe mirrors createRecipe time↔cookTimeMin bidirectional field mapping for backend cookTimeMin"
    - "Delete wrapper pattern: deleteRecipe returns Promise<void> matching existing deleteComment convention"

key-files:
  created: []
  modified:
    - "frontend/src/api/recipes.ts — added updateRecipe and deleteRecipe wrappers"
    - "frontend/src/pages/EditRecipe.tsx — rewritten with auth guard, pre-populated form, delete with confirmation"
    - "frontend/src/pages/RecipeDetail.tsx — upgraded delete handler to use wrapper + sonner toast"
    - "frontend/src/App.tsx — wired /edit/:id protected route"

key-decisions:
  - "time↔cookTimeMin field mapping in updateRecipe follows createRecipe pattern for consistency"
  - "deleteRecipe returns void (204 no-content) matching deleteComment convention"
  - "Auth guard uses client-side redirect to /unauthorized; backend PUT/DELETE independently check authorId (defense in depth)"
  - "Delete confirmation uses Danger Zone UI pattern on edit page, inline confirmation on detail page"

patterns-established: []

requirements-completed: [RECIPE-05, RECIPE-06]

# Metrics
duration: 8min
completed: 2026-06-05
---

# Phase 03 Plan 03: Edit & Delete Recipe Summary

**Edit and delete recipe vertical slices: pre-populated edit form with auth guard, delete with confirmation dialog and sonner toasts**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-05T15:44:44Z
- **Completed:** 2026-06-05T15:52:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added `updateRecipe` and `deleteRecipe` API wrappers to recipes.ts (time↔cookTimeMin field mapping, consistent with existing createRecipe pattern)
- Rewrote EditRecipe.tsx: removed @ts-nocheck and apiFetch, added auth guard (redirect to /unauthorized for non-owners), pre-populated RecipeForm via initialData prop, Danger Zone delete section with confirmation dialog
- Upgraded RecipeDetail.tsx delete handler: replaced raw `api.delete` + `alert()` with `deleteRecipe` wrapper + `toast.success`/`toast.error`
- Wired `/edit/:id` protected route in App.tsx wrapping `<EditRecipe />` in `<ProtectedRoute>`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updateRecipe/deleteRecipe wrappers, rewrite EditRecipe** - `94d1ca5` (feat)
2. **Task 2: Upgrade RecipeDetail delete, wire /edit/:id route** - `cd1a4f8` (feat)

## Files Created/Modified

- `frontend/src/api/recipes.ts` - Added `updateRecipe(id, data)` with time↔cookTimeMin mapping and `deleteRecipe(id)` returning void
- `frontend/src/pages/EditRecipe.tsx` - Complete rewrite: @ts-nocheck removed, apiFetch removed, uses API wrappers, auth guard, pre-populated RecipeForm, Danger Zone delete with confirmation
- `frontend/src/pages/RecipeDetail.tsx` - Upgraded handleDeleteRecipe: deleteRecipe wrapper instead of raw api.delete, sonner toast instead of alert()
- `frontend/src/App.tsx` - Added EditRecipe import and `<Route path="/edit/:id">` protected route

## Decisions Made

- time↔cookTimeMin field mapping in updateRecipe follows createRecipe pattern for consistency across all API wrappers
- deleteRecipe returns void (204 no-content) matching the existing deleteComment convention in the same file
- Auth guard uses client-side redirect to /unauthorized; backend PUT/DELETE independently check authorId — defense in depth against tampered requests
- Delete confirmation uses Danger Zone UI pattern on edit page, inline confirmation on detail page — both patterns match their respective page layouts

## Deviations from Plan

None — plan executed exactly as written.

### Verification note

`npx tsc --noEmit` produces two pre-existing errors in `RecipeForm.tsx` (TS2448 and TS2345 relating to image dropzone code added outside this plan's scope). These are not caused by this plan's changes — all four files modified in this plan compile without errors. The pre-existing RecipeForm.tsx errors are out of scope per deviation rule scope boundary.

## Issues Encountered

None — both tasks completed without blockers. The only notable observation was pre-existing `RecipeForm.tsx` TypeScript errors that existed in the working tree before this plan started (unrelated image dropzone WIP code). These are documented above as a verification note, not an execution issue.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Edit and delete recipe vertical slices are complete
- Users can navigate to /edit/:id for their recipes, modify any field, and see success toast on update
- Users can delete their recipes with confirmation dialog and see success toast
- Non-owners are redirected to /unauthorized
- STUB: The `/unauthorized` path renders as the NotFound 404 page — the Unauthorized component exists but has no route in App.tsx. This is a pre-existing gap carried forward.

---

*Phase: 03-recipe-management*
*Completed: 2026-06-05*

## Self-Check: PASSED

- [x] All 5 files exist on disk (recipes.ts, EditRecipe.tsx, RecipeDetail.tsx, App.tsx, SUMMARY.md)
- [x] Both task commits verified in git log (94d1ca5, cd1a4f8)
- [x] All acceptance criteria verified per task
