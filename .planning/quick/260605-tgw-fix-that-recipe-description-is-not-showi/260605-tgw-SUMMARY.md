---
quick_task_id: 260605-tgw
type: quick-fix
status: completed
completed_at: "2026-06-06"
wave: 1
commits:
  - hash: d69c8cb
    message: "feat(260605-tgw): show recipe description on card component"
  - hash: 6caddd8
    message: "fix(260605-tgw): save bio during registration - backend was ignoring bio field"
key-files:
  modified:
    - frontend/src/components/RecipeCard.tsx
    - backend/src/controllers/authController.ts
duration: 3m
---

# Quick Task 260605-tgw: Fix recipe description and bio not showing on profile

- Added recipe description display to RecipeCard component between the title and characteristics row (line-clamp-2 truncation)
- Fixed backend registration controller ignoring the `bio` field from request body — bio is now saved to the user document during registration

## Success Criteria

- [x] Description text visible on recipe cards in profile page
- [x] Long descriptions truncated to 2 lines
- [x] Bio field saved during registration (backend was dropping it)
- [x] TypeScript compilation passes
