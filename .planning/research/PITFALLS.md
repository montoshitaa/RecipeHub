# Domain Pitfalls

**Domain:** Collaborative recipe platform — React 18 + Vite frontend
**Researched:** 2026-06-04

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Tailwind CSS v3 Configuration Applied to v4

**What goes wrong:** Developer copies Tailwind v3 setup (PostCSS config, `tailwind.config.js`, `@tailwind base/components/utilities` directives) into a v4 project.

**Why it happens:** Most Tailwind tutorials, blog posts, and LLM training data still reference v3 patterns. Tailwind v4 (released early 2025) radically simplified configuration.

**Consequences:** Styles don't apply. Build errors about missing PostCSS plugin. Hours of debugging configuration files that shouldn't exist.

**Prevention:**
- Use `@import "tailwindcss"` in `src/index.css` (NOT `@tailwind base; @tailwind components; @tailwind utilities;`)
- Use `@tailwindcss/vite` plugin in `vite.config.js` (NOT PostCSS config)
- Do NOT create a `tailwind.config.js` file. v4 uses CSS-based configuration via `@theme` directive
- Reference only Tailwind v4 documentation: https://tailwindcss.com/docs/installation/vite

**Detection:** If you see `postcss.config.js` or `tailwind.config.js` in the project, it's likely the wrong approach.

### Pitfall 2: Dynamic Form Fields Without useFieldArray

**What goes wrong:** Recipe forms need dynamic ingredient rows and step rows. Developer tries to manage these with `useState([...])` and manual add/remove/update logic.

**Why it happens:** `useFieldArray` is less discoverable than basic `register()`. Developers often reach for `useState` arrays first.

**Consequences:** 
- Stale closures when removing items (index shift bugs)
- Zombie child components (removed row's state persists)
- Validation doesn't work on dynamically added/removed fields
- Rewriting forms after discovering these bugs costs 2-3 days

**Prevention:** Use `useFieldArray` from react-hook-form for any array field:
```jsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'ingredients' // or 'steps'
});
```

Each field is keyed by `field.id` (stable, not array index). Zod schema validates the array structure.

**Detection:** If you find `useState` managing arrays of form inputs, refactor to `useFieldArray` immediately.

### Pitfall 3: Image Upload Without Backend Endpoint

**What goes wrong:** Frontend builds full image upload UI with react-dropzone, but there's no backend endpoint to receive the file. The Recipe model has `imageUrl` field but no upload route.

**Why it happens:** The backend has CRUD for recipes but file upload is a new, separate concern. Easy to overlook during frontend planning.

**Consequences:** Frontend upload UI is built but non-functional. Must pause frontend work to build backend upload endpoint.

**Prevention:** Build the `POST /api/upload` endpoint FIRST or in parallel. It needs:
- multer middleware for `multipart/form-data` parsing
- File type validation (image/jpeg, image/png, image/webp only)
- File size limit (5MB max)
- Storage to `/uploads/` directory (served as static files via Express)
- Returns `{ imageUrl: "/uploads/filename.jpg" }`

**Detection:** Verify `POST /api/upload` works with curl/Postman before building frontend upload UI.

### Pitfall 4: shadcn/ui with TypeScript Components in a JSX Project

**What goes wrong:** Running `npx shadcn@latest add` generates `.tsx` component files, but the project uses `.jsx`. Build fails on TypeScript syntax.

**Why it happens:** shadcn/ui defaults to TypeScript. The project uses JavaScript (no `tsconfig.json`).

**Consequences:** Cannot use generated components without manual conversion or project migration.

**Prevention:** Option A (recommended) — Add a minimal `tsconfig.json` with `allowJs: true` so TypeScript components can coexist with JSX files. Vite handles `.tsx` natively with esbuild. Option B — convert shadcn components to JSX by stripping types. Option C — convert the whole project to TypeScript (largest effort, highest long-term value, but not required for this milestone).

**Detection:** After running `npx shadcn@latest add`, try `npm run dev`. If it fails on TypeScript syntax, choose one of the options above.

## Moderate Pitfalls

### Pitfall 5: Form Submission Without Optimistic UI or Loading State

**What goes wrong:** User clicks "Publish Recipe" and nothing happens for 2-3 seconds while the API call completes.

**Why it happens:** Forgot to disable the submit button and show loading state during async submission.

**Consequences:** Users double-click (duplicate submissions). Perceived as broken/slow.

**Prevention:** Use RHF's `formState.isSubmitting` to disable the submit button and show a spinner:
```jsx
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Publishing...' : 'Publish Recipe'}
</Button>
```

### Pitfall 6: CORS Issues on Image Upload

**What goes wrong:** Frontend on `localhost:5173` uploads to backend on `localhost:4000`. CORS error on the upload endpoint.

**Why it happens:** The existing CORS config covers JSON API routes but `POST /api/upload` with `multipart/form-data` content type may trigger a preflight that fails.

**Consequences:** Image upload works in dev (Vite proxy) but breaks in production with separate domains.

**Prevention:** Verify CORS allows all methods and content types needed. The Vite dev proxy (`/api` → `localhost:4000`) handles this in dev. For production, ensure the Express CORS middleware allows `Content-Type: multipart/form-data` and the `POST` method.

### Pitfall 7: Not Handling Image Upload Errors Gracefully

**What goes wrong:** User selects a 20MB image or a PDF file. The upload fails silently or with a raw error message.

**Why it happens:** Only validating on the backend. User gets a poor experience.

**Consequences:** Frustrated users, support burden.

**Prevention:** Validate on the frontend WITH react-dropzone before upload:
```jsx
const { getRootProps, getInputProps, fileRejections } = useDropzone({
  accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 1,
});
// fileRejections contains human-readable errors to display
```

### Pitfall 8: Zod Schema Diverging From Backend Validation

**What goes wrong:** Zod schema on frontend accepts fields that backend rejects, or vice versa. Subtle validation mismatches.

**Why it happens:** Backend validation is hand-written in `recipeController.js`. Frontend Zod schema is independently authored. They drift.

**Consequences:** User fills out a form that passes frontend validation, hits submit, gets a 400 error from backend. Confusing experience.

**Prevention:** Align Zod schema exactly with `validateRecipePayload` in `recipeController.js`. Key fields to match:
- `difficulty`: enum `['Easy', 'Medium', 'Hard']`
- `ingredients`: each must have `name` (string), `amount` (positive number), `unit` (string)
- `steps`: array of non-empty strings
- `tags`: optional string array
- `cookTimeMin`, `servings`: positive numbers

## Minor Pitfalls

### Pitfall 9: Tailwind Class Name Conflicts with shadcn/ui

**What goes wrong:** Applying Tailwind classes to shadcn components that already have default styles, causing unexpected visual results.

**Why it happens:** shadcn components use Tailwind classes internally. Adding conflicting classes (e.g., different padding) creates specificity battles.

**Consequences:** Components look broken. "Why is my button padding wrong?"

**Prevention:** Use shadcn's `className` prop for overrides (designed for this). Prefer shadcn's variant props (e.g., `<Button variant="destructive">`) over manually overriding classes.

### Pitfall 10: Missing Alt Text on Recipe Images

**What goes wrong:** Recipe images rendered with `<img src={recipe.imageUrl}>` without alt text.

**Why it happens:** Image URL comes from database, easy to forget alt attribute.

**Consequences:** Accessibility violation. Screen reader users get no context.

**Prevention:** Always include `alt={recipe.title}` on recipe images. shadcn/ui Avatar component also supports alt text.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Tailwind v4 setup | Using v3 config patterns (#1) | Follow only v4 docs: `@import "tailwindcss"` + Vite plugin. No config files |
| Recipe forms | Managing dynamic fields with useState (#2) | Use `useFieldArray` from day one. All recipe forms need it |
| Image upload | No backend endpoint (#3) | Build `POST /api/upload` before or in parallel with frontend upload UI |
| shadcn/ui init | TypeScript files in JSX project (#4) | Add `tsconfig.json` with `allowJs: true`, or strip types from shadcn files |
| Form submission | No loading state on submit button (#5) | Always check `formState.isSubmitting` |
| Zod schemas | Diverging from backend validation (#8) | Cross-reference `recipeController.js` `validateRecipePayload` function |
| Responsive design | Mobile-first not enforced | Start every component at mobile (`sm:`) breakpoint, add `md:` and `lg:` overrides |

## Sources

- Tailwind CSS v4 migration guide: https://tailwindcss.com/docs/upgrade-guide — v3→v4 breaking changes
- React Hook Form `useFieldArray` docs: https://react-hook-form.com/docs/usefieldarray — dynamic form fields
- react-dropzone docs: validation, file rejection, preview generation
- shadcn/ui docs: installation with Vite, component API, className override pattern
- Existing backend code: `backend/src/controllers/recipeController.js` §`validateRecipePayload` — validation logic to match
