# Architecture Patterns

**Domain:** Collaborative recipe platform — React 18 + Vite frontend
**Researched:** 2026-06-04

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App (root)                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  AuthProvider                      │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │              BrowserRouter                    │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  Navbar (always visible)               │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Routes (page-level components)  │  │  │  │  │
│  │  │  │  │  HomePage  │ RecipeDetail       │  │  │  │  │
│  │  │  │  │  NewRecipe │ EditRecipe         │  │  │  │  │
│  │  │  │  │  Profile   │ Login / Register   │  │  │  │  │
│  │  │  │  └─────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Sonner <Toaster /> (global toast notifications)   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `AuthProvider` | Holds `user` state + JWT token. Provides `useAuth()` hook to all children | All components via context. `Navbar` for user menu. Protected routes for auth gating |
| `Navbar` | Top navigation bar with logo, nav links, user menu (login/logout/profile). Responsive hamburger on mobile | `AuthProvider` for user state. React Router for navigation |
| `HomePage` | Recipe feed with filter bar (category, difficulty, tags, search). Grid of `RecipeCard` components | `GET /api/recipes` with query params. URL query params for filter state |
| `RecipeCard` | Single recipe preview: image thumbnail, title, author, difficulty badge, cook time, servings. Links to detail page | `HomePage` (parent). React Router `<Link>` to `/recipes/:id` |
| `RecipeDetailPage` | Full recipe view: hero image, title/author/difficulty/tags, ingredients list, steps list, comment section | `GET /api/recipes/:id`. Comment section: `GET /api/recipes/:id/comments`, `POST` new comment. `AuthProvider` for author-only delete |
| `NewRecipePage` / `EditRecipePage` | Multi-field form: title, description, category, difficulty select, cook time, servings, dynamic ingredients (name/amount/unit rows), dynamic steps, tags, image upload with dropzone preview | `POST /api/recipes` (create), `PUT /api/recipes/:id` (edit). `POST /api/upload` for image. `AuthProvider` for auth header |
| `ProfilePage` | User info (avatar, name, bio) + grid of user's published recipes | `GET /api/recipes?author=:id` (or user-specific endpoint). `AuthProvider` for current user |
| `LoginPage` / `RegisterPage` | Auth forms → `POST /api/auth/login`, `POST /api/auth/register` | `AuthProvider.setUser()` on success. React Router redirect on login |
| `CommentSection` | List of comments with star ratings. Comment form (textarea + star selector). Delete button for own comments | `RecipeDetailPage` (parent). `GET/POST/DELETE /api/recipes/:id/comments` |

### Data Flow

```
User Action → React Component → axios API call → Express Backend → MongoDB
                    ↑                                              │
                    └──────── JSON response ←──────────────────────┘
                    
Form submissions:
  User fills form → RHF validates (zod schema) → passes? → axios POST/PUT → backend validates → 201/200
                                                  fails? → inline error messages (no API call)

Image upload:
  User drops/selects file → react-dropzone preview → user submits form →
    frontend sends image to POST /api/upload → gets back { imageUrl } →
    includes imageUrl in recipe POST/PUT payload

Auth flow:
  Login → POST /api/auth/login → { token, user } → localStorage.setItem('token') → setUser(user)
  Every API call → axios interceptor adds Authorization: Bearer <token>
  401 response → clear token → redirect to /login
```

## Patterns to Follow

### Pattern 1: Page-Level Data Fetching with Local State

**What:** Each page component fetches its own data using `useEffect` + axios. State lives in the page component. No global store.

**When:** Every page. This is the established project pattern — no state management library.

**Example:**
```jsx
// HomePage.jsx
function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '', tags: '' });

  useEffect(() => {
    setLoading(true);
    recipeApi.getRecipes(filters)
      .then(data => setRecipes(data.recipes))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      {loading ? <SkeletonGrid /> : <RecipeGrid recipes={recipes} />}
    </div>
  );
}
```

### Pattern 2: React Hook Form with Zod Schema Validation

**What:** Define a Zod schema matching the backend's expected payload. Pass it to `useForm({ resolver: zodResolver(schema) })`. Use `useFieldArray` for dynamic lists (ingredients, steps).

**When:** Every form — create recipe, edit recipe, login, register, comment.

**Example:**
```jsx
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  cookTimeMin: z.number().positive('Must be positive'),
  servings: z.number().positive('Must be positive'),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    unit: z.string().min(1),
  })).min(1, 'At least one ingredient required'),
  steps: z.array(z.string().min(1)).min(1, 'At least one step required'),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

function RecipeForm({ initialData, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || { ingredients: [{ name: '', amount: 0, unit: '' }], steps: [''] },
  });

  const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } =
    useFieldArray({ control: form.control, name: 'ingredients' });

  const { fields: stepFields, append: addStep, remove: removeStep } =
    useFieldArray({ control: form.control, name: 'steps' });

  // ... render form with shadcn/ui Form, FormField, Input, etc.
}
```

### Pattern 3: API Module Pattern (existing)

**What:** Each API domain has its own module in `src/api/` that exports functions returning axios promises. The axios instance in `src/api/axios.js` has the base URL and auth interceptor.

**When:** Every API call. Already established — extend, don't replace.

**Example:**
```js
// src/api/uploadApi.js
import axios from './axios';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};
```

### Pattern 4: Toast Notifications via Sonner

**What:** Import `toast` from `sonner` and call `toast.success()` / `toast.error()` after async operations. `<Toaster />` renders once in `App.jsx` root.

**When:** After form submissions, image uploads, comment posts, auth actions, errors.

**Example:**
```jsx
// In App.jsx
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

// In any component
import { toast } from 'sonner';
toast.success('Recipe published!');
toast.error('Failed to upload image');
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Prop Drilling Across Multiple Levels

**What:** Passing props through 3+ component layers.

**Why bad:** Makes refactoring painful. Intermediate components become coupled to data they don't use.

**Instead:** Use `useAuth()` context for auth state. For page-level data, fetch it in the page component and pass only 1-2 levels deep to child components. If drilling goes deeper, extract a context or compose components differently.

### Anti-Pattern 2: Inline API Calls in Components

**What:** Writing `axios.post('/api/recipes', data)` directly in a component.

**Why bad:** Duplicated base URL, error handling, and auth headers. Hard to test.

**Instead:** Use the existing API module pattern (`src/api/recipeApi.js`). Create `src/api/uploadApi.js` for the new upload endpoint.

### Anti-Pattern 3: Controlled File Input for Image Upload

**What:** Using `<input type="file" onChange={...}>` with manual FileReader for preview.

**Why bad:** No drag-and-drop. Manual preview code is brittle. No built-in file type/size validation.

**Instead:** Use `react-dropzone`'s `useDropzone` hook. It provides `acceptedFiles`, `fileRejections`, preview generation, drag state, and is accessible out of the box.

### Anti-Pattern 4: Managing Dynamic Form Fields Manually

**What:** Using `useState` arrays and manually adding/removing/syncing form field values for ingredients and steps.

**Why bad:** Stale state bugs. Zombie child issues when removing fields. Manual validation of each row.

**Instead:** Use RHF's `useFieldArray`. It handles field addition/removal, proper indexing, and integrates seamlessly with Zod schema validation.

## Scalability Considerations

| Concern | At 100 recipes | At 10K recipes | At 1M recipes |
|---------|--------------|--------------|-------------|
| Recipe feed loading | Fetch all — fine | Add pagination (limit/offset on `GET /api/recipes`) | Add cursor-based pagination. Backend change only |
| Image storage | Local disk via multer — fine | Move to S3-compatible storage. `imageUrl` field is already URL-agnostic | CDN in front of S3. No frontend changes needed |
| Form complexity | RHF + zod handles current form depth | Same pattern scales — add more fields to schema | Extract reusable field components if forms proliferate |
| Bundle size | Tailwind (zero-runtime) + shadcn (tree-shakeable) + lucide (per-icon) | Same. No runtime CSS cost with Tailwind v4 | Add `vite-plugin-visualizer` to audit chunk sizes |
| Auth | JWT in localStorage — fine | Same pattern. Token refresh not needed for v1 (7-day expiry) | Add silent token refresh if session duration becomes an issue |

## Sources

- Existing codebase: `AuthContext.jsx`, `AppRouter.jsx`, `src/api/` pattern
- react-hook-form docs: `useFieldArray` API, `zodResolver` integration
- react-dropzone docs: `useDropzone` hook reference
- shadcn/ui docs: Form component integration with react-hook-form
- Sonner docs: Toaster setup and toast API
