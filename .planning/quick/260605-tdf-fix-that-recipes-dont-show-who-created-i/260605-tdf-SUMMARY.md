---
quick_task_id: 260605-tdf
type: quick-fix
status: completed
completed_at: "2026-06-06"
wave: 1
commits:
  - hash: 8061808
    message: "fix(260605-tdf): correct normalizeRecipe authorId and authorName extraction"
  - hash: 4e9f748
    message: "feat(260605-tdf): show author name on recipe cards"
key-files:
  modified:
    - frontend/src/api/recipes.ts
    - frontend/src/components/RecipeCard.tsx
tech-stack:
  added: []
duration: 5m
---

# Quick Task 260605-tdf: Fix recipes not showing who created them

Fix two related bugs: (1) recipe author name not displaying on recipe cards or detail pages, and (2) Profile page "My Recipes" section always empty because `authorId` was being assigned as an object (the populated Mongo document) instead of a string, breaking `authorId === user._id` comparisons.

**Root cause:** Backend `GET /api/recipes` uses `populate('authorId', 'name email bio avatarUrl createdAt')`, so `raw.authorId` is a populated document (`{ _id, name, ... }`), not a plain string. The original `authorId: raw.authorId || ...` assigned the entire object to the `authorId` field (expected to be a string).

## Tasks Executed

### Task 1: Fix normalizeRecipe (8061808)
Fixed `authorId` and `authorName` extraction in `normalizeRecipe()`:

- `authorId`: Tries `raw.authorId?._id` first (populated object case), falls back to `raw.authorId` (plain string case), then `raw.author?._id` / `raw.author?.id` as last resort
- `authorName`: Tries `raw.authorName` first, then `raw.authorId?.name` (populated object), then `raw.author?.name`, defaulting to `''`

### Task 2: Show author name on RecipeCard (4e9f748)
Added author name display in the metadata row of recipe cards:

- Category and author name shown on same line with a dot separator
- Long names truncated with `max-w-[120px]` and `truncate` class
- Full name visible on hover via `title` attribute
- Falls back to "Anonymous" when authorName is undefined

## Verification

- [x] TypeScript compilation passes (`tsc --noEmit` — zero errors)
- [x] `normalizeRecipe` assigns `authorId` as a string in both populated and unpopulated paths
- [x] `normalizeRecipe` extracts `authorName` from `raw.authorId.name` when populated
- [x] RecipeCard renders `recipe.authorName` with truncation

## Success Criteria

- [x] Recipe cards show author name as "category · by AuthorName"
- [x] Recipe detail page shows actual author name (was "RecipeHub Chef")
- [x] Profile page "My Recipes" section populates with user's recipes
- [x] TypeScript compilation passes with no errors

## Self-Check: PASSED

All files exist, all commits present, all patterns verified.
