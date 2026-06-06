---
status: complete
date: 2026-06-06
---

## Summary

### Fixes Applied

1. **Login button style** — Removed undefined `btn-primary` class from Header sign-in link (`Header.tsx:66`)
2. **`/` route redirect** — Wrapped Home route with ProtectedRoute so unauthenticated users get redirected to `/login` (`App.tsx:42`)
3. **Toast feedback on auth failure** — Added `toast.error()` calls in Login.tsx and Register.tsx catch blocks
4. **`recipes.filter is not a function`** — Made `getRecipes()` return a guaranteed array (handles `res.data.recipes` and `res.data` shapes) and added defensive `safeRecipes` guard in Home.tsx

### Files Modified
- `frontend/src/components/Header.tsx` — Removed `btn-primary` class
- `frontend/src/App.tsx` — ProtectedRoute wrapper on `/`
- `frontend/src/api/recipes.ts` — Defensive array return in `getRecipes`
- `frontend/src/pages/Home.tsx` — `safeRecipes` guard for filter
- `frontend/src/pages/Login.tsx` — Added `toast.error()` on failure
- `frontend/src/pages/Register.tsx` — Added `toast.error()` on failure
