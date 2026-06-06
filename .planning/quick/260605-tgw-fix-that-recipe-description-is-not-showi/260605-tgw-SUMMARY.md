---
quick_task_id: 260605-tgw
type: quick-fix
status: completed
completed_at: "2026-06-06"
wave: 1
commits:
  - hash: HEAD
    message: "feat(260605-tgw): show recipe description on card component"
key-files:
  modified:
    - frontend/src/components/RecipeCard.tsx
duration: 2m
---

# Quick Task 260605-tgw: Fix recipe description not showing on profile recipe cards

Added recipe description display to RecipeCard component between the title and characteristics row. Description is shown only when `recipe.description` is non-empty, uses `line-clamp-2` for truncation, and renders in muted text.

## Success Criteria

- [x] Description text visible on recipe cards in profile page
- [x] Long descriptions truncated to 2 lines
- [x] TypeScript compilation passes
