---
quick_task_id: 260605-tdf
type: quick-fix
wave: 1
autonomous: true
files_modified:
  - frontend/src/api/recipes.ts
  - frontend/src/components/RecipeCard.tsx
---

<objective>
Fix two related bugs: (1) recipe cards and recipe detail pages don't show the recipe author's name properly, and (2) the profile page's "My Recipes" section is always empty because client-side authorId filtering fails.

**Root cause:** `normalizeRecipe()` in `api/recipes.ts` doesn't correctly destructure the populated `authorId` object that the backend returns. The backend `GET /api/recipes` and `GET /api/recipes/:id` endpoints use `Recipe.find().populate('authorId', 'name email bio avatarUrl createdAt')`, so `raw.authorId` arrives as a populated document `{ _id, name, ... }` — not a plain string. The current normalization:

- `authorId: raw.authorId || ...` → assigns the entire populated object to `authorId` (typing expects `string`), breaking `recipe.authorId === user._id` comparisons in Profile.tsx
- `authorName: raw.authorName || raw.author?.name || raw.authorName` → never reads `raw.authorId?.name`, so `authorName` is always undefined

Additionally, `RecipeCard.tsx` never renders the author name at all.
</objective>

<context>
@frontend/src/api/recipes.ts
@frontend/src/components/RecipeCard.tsx
@frontend/src/pages/Profile.tsx
@frontend/src/pages/RecipeDetail.tsx
@frontend/src/types.ts
@backend/src/controllers/recipeController.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix normalizeRecipe to correctly extract authorId and authorName from populated authorId</name>
  <files>frontend/src/api/recipes.ts</files>
  <action>
    In `normalizeRecipe()`, fix the `authorId` and `authorName` extractors:

    **Current (buggy):**
    ```ts
    authorId: raw.authorId || raw.author?._id || raw.author?.id || '',
    authorName: raw.authorName || raw.author?.name || raw.authorName,
    ```

    **Replace with:**
    ```ts
    authorId: raw.authorId?._id || raw.authorId || raw.author?._id || raw.author?.id || '',
    authorName: raw.authorName || raw.authorId?.name || raw.author?.name || '',
    ```

    **Why this fix is correct:**
    - When backend populates `authorId`, `raw.authorId` is `{ _id: "abc", name: "John", ... }` (truthy object). So `raw.authorId?._id` extracts the string ID first.
    - When backend does NOT populate (e.g., raw stored as plain string ObjectId), `raw.authorId` is a string, so `raw.authorId?._id` evaluates to `undefined`, and it falls through to `raw.authorId` (the string).
    - `raw.authorId?.name` extracts the author's name from the populated object when present.
    - `raw.author` does not exist in the backend response shape — only `raw.authorId` is populated.

    These two small changes fix both bugs: authorName appears on RecipeDetail (line 347-356 already renders `recipe.authorName`) and the Profile.tsx `authorId === user._id` comparison now compares strings correctly.
  </action>
  <verify>
    <automated>
      # Verify the logic by checking for correct destructuring patterns
      grep -n 'authorId:' frontend/src/api/recipes.ts | grep -q 'raw.authorId?._id' && echo "PASS: authorId extracts _id from populated object" || echo "FAIL: authorId not fixed"
      grep -n 'authorName:' frontend/src/api/recipes.ts | grep -q 'raw.authorId?.name' && echo "PASS: authorName extracts from populated authorId" || echo "FAIL: authorName not fixed"
    </automated>
  </verify>
  <done>
    - `normalizeRecipe` assigns `authorId` as a string (not an object) in both populated and unpopulated paths
    - `normalizeRecipe` correctly extracts `authorName` from `raw.authorId.name` when populated
    - Recipe detail page shows the actual author name instead of "RecipeHub Chef"
    - Profile page "My Recipes" section shows the logged-in user's recipes
  </done>
</task>

<task type="auto">
  <name>Task 2: Add author name display to RecipeCard</name>
  <files>frontend/src/components/RecipeCard.tsx</files>
  <action>
    Add the recipe author's name to the card so users can see who created each recipe.

    In the metadata row (line 151-154), currently:
    ```
    category | difficulty badge
    ```

    Replace the single `<span>{recipe.category}</span>` with a flex row that shows `{recipe.category}` followed by a small dot separator and `by {recipe.authorName || 'Anonymous'}`.

    Specifically, change lines 151-154 from:
    ```tsx
    <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-text-muted mb-2">
      <span>{recipe.category}</span>
      <Badge className={difficultyBadgeClass}>{recipe.difficulty}</Badge>
    </div>
    ```

    To:
    ```tsx
    <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-text-muted mb-2">
      <span className="truncate flex items-center gap-1.5">
        <span>{recipe.category}</span>
        <span className="opacity-40 mx-0.5">·</span>
        <span className="truncate max-w-[120px]" title={recipe.authorName || 'Anonymous'}>
          {recipe.authorName || 'Anonymous'}
        </span>
      </span>
      <Badge className={difficultyBadgeClass}>{recipe.difficulty}</Badge>
    </div>
    ```

    Design rationale:
    - Category and author on the same line keeps the compact card layout
    - Small dot separator visually distinguishes category from author
    - `truncate` + `max-w-[120px]` prevents long author names from breaking the layout
    - `title` attribute shows full name on hover
    - Uses `recipe.authorName` which is now correctly populated after Task 1's fix
  </action>
  <verify>
    <automated>
      grep -q 'authorName' frontend/src/components/RecipeCard.tsx && echo "PASS: RecipeCard references authorName" || echo "FAIL: authorName not found in RecipeCard"
      grep -q 'truncate' frontend/src/components/RecipeCard.tsx && echo "PASS: truncation class found" || echo "FAIL: no truncation class"
    </automated>
  </verify>
  <done>
    - Recipe cards in the catalog feed show the author's name next to the category
    - Long author names are truncated with ellipsis (full name on hover via title attribute)
    - Recipes with undefined authorName gracefully fall back to "Anonymous"
    - No layout breakage from long names
  </done>
</task>

</tasks>

<verification>
1. Run `npm run build` or `npx tsc --noEmit` in `frontend/` to verify no TypeScript errors
2. Manual: Open the app, browse recipe catalog — each card should show "category · by AuthorName"
3. Manual: Open a recipe detail page — the author box should show the actual author's name, not "RecipeHub Chef"
4. Manual: Login and visit /profile — the "My Recipes" section should list recipes created by the logged-in user
</verification>

<success_criteria>
- [ ] Recipe cards show author name as "category · by AuthorName"
- [ ] Recipe detail page shows actual author name (not "RecipeHub Chef")
- [ ] Profile page "My Recipes" section populates with user's recipes
- [ ] TypeScript compilation passes with no errors
</success_criteria>
