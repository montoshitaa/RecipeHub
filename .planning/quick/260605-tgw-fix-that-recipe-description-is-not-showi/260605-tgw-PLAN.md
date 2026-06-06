---
quick_task_id: 260605-tgw
type: quick-fix
wave: 1
autonomous: true
files_modified:
  - frontend/src/components/RecipeCard.tsx
---

<objective>
Add recipe description display to RecipeCard component so description text is visible on profile page recipe cards.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Add description to RecipeCard</name>
  <files>frontend/src/components/RecipeCard.tsx</files>
  <action>
    Insert a description paragraph between the title and the characteristics row in RecipeCard, shown only when `recipe.description` is non-empty, with `line-clamp-2` for truncation.
  </action>
  <verify>
    RecipeCard renders recipe.description text when present
  </verify>
  <done>
    - Description text visible on recipe cards
    - Long descriptions truncated to 2 lines
    - No TypeScript errors
  </done>
</task>

</tasks>
