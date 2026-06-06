# Plan: fix-the-login-button-style-and-firefox-and-more

## Task 1: Fix recipes.filter error in Home.tsx
- **Files**: `frontend/src/pages/Home.tsx`, `frontend/src/api/recipes.ts`
- **Action**: Add null safety to `getRecipes` return value. Backend may return `res.data.recipes` (object) or plain array. Make `getRecipes` handle both shapes and default to `[]`.
- **Verify**: `recipes.filter` no longer throws when data is null/undefined.

## Task 2: Fix login button style in Header
- **Files**: `frontend/src/components/Header.tsx`
- **Action**: Remove `btn-primary` class from Sign-in Link (undefined class).
- **Verify**: Button renders with valid Tailwind classes only.

## Task 3: Fix / route to redirect unauthenticated users to login
- **Files**: `frontend/src/App.tsx`
- **Action**: Wrap Home route with ProtectedRoute so unauthenticated users get redirected to `/login`.
- **Verify**: Visiting `/` when not logged in redirects to `/login`.

## Task 4: Add toast feedback on login/register failure
- **Files**: `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx`
- **Action**: Add `toast.error()` calls in catch blocks for both login and register forms.
- **Verify**: Failed login/register attempt shows sonner toast with error message.
