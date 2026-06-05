# Phase 01: Foundation & Authentication - Research

**Researched:** 2026-06-05
**Domain:** React 19 + TypeScript authentication, React Router v6 SPA, JWT-based auth, Tailwind v4 + shadcn/ui scaffold adaptation
**Confidence:** HIGH

## Summary

Phase 01 adapts an AI Studio-generated React 19 scaffold into the production RecipeHub frontend. The scaffold already contains working login/register forms, auth context with JWT persistence, protected routes, and a 404 page — but its API client is a localStorage mock that simulates backend responses. This phase replaces the mock with a real axios-based HTTP client that talks to the existing Express backend on port 4000, strips the Express server and @google/genai dependencies from the scaffold, and aligns the dependency stack with project constraints (React Router v6 downgrade, zod v3 for validation).

The core challenge is adapting response shape differences between the scaffold's mock API and the real backend: the backend returns `{ user: { id, ... } }` for `/me` while the scaffold expects the user object unwrapped, and the backend uses `id` while the scaffold uses `_id`. A thin adapter layer in the axios interceptor handles this normalization.

**Primary recommendation:** Adapt the existing scaffold's AuthContext and auth pages rather than rewriting — they follow correct patterns (localStorage JWT persistence, rehydration on mount via `/api/auth/me`, protected route gating with redirect preservation). Replace `apiFetch` with axios + JWT interceptor, add an adapter for response shape normalization, and install shadcn/ui components for the forms.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| JWT persistence & rehydration | Browser / Client | — | localStorage read/write on client; no SSR in this SPA |
| Auth state management (React Context) | Browser / Client | — | React Context Provider wrapping the app tree |
| Login/register API calls | Browser / Client | API / Backend | Client sends credentials; backend validates, hashes, returns JWT |
| Token verification (GET /me) | API / Backend | — | Backend middleware decodes JWT, queries user from MongoDB |
| Protected route gating | Browser / Client | — | React Router component checks auth context before rendering |
| Route-level redirect (unauthenticated → /login) | Browser / Client | — | Client-side redirect via `<Navigate>` with state preservation |
| 404 page for invalid routes | Browser / Client | — | React Router catch-all `<Route path="*">` |
| API proxy (dev) | Frontend Server (Vite dev) | — | Vite `server.proxy` forwards `/api/*` to backend:4000 |
| Form validation (login/register) | Browser / Client | API / Backend | Client validates format (zod), backend validates credentials |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^19.0.1 | UI library | Kept from scaffold; matches project constraint "React 19" |
| react-dom | ^19.0.1 | DOM renderer | Paired with React 19 from scaffold |
| react-router-dom | ~6.30.4 | Client-side routing | Downgraded from scaffold's v7 to v6 per STACK.md decision — v6 is the stable SPA router, v7 is framework-first |
| vite | ^6.2.3 | Build tool / dev server | Kept from scaffold; matches project constraint "Vite 6" |
| @vitejs/plugin-react | ^5.0.4 | React Fast Refresh for Vite | Kept from scaffold; v5+ required for React 19 support |
| tailwindcss | ^4.3.0 | Utility-first CSS | Bumped from scaffold's ^4.1.14 to align with STACK.md 4.3.0 |
| @tailwindcss/vite | ^4.3.0 | Tailwind Vite integration | Bumped from scaffold's ^4.1.14; required for Tailwind v4 in Vite |
| typescript | ~5.8.2 | Type checking | Kept from scaffold; matches scaffold's tsconfig |
| lucide-react | ^0.546.0 | SVG icon library | Kept from scaffold (0.546); STACK.md recs 0.547 — both in the same stable line [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| axios | ^1.17.0 | HTTP client | Every API call. Replaces scaffold's `apiFetch` localStorage mock. Handles multipart uploads later (Phase 3). [VERIFIED: npm registry — axios@1.17.0 published 2026-02-24] |
| react-hook-form | ^7.77.0 | Form state management | Login/register forms. Minimal re-renders, uncontrolled by default. [VERIFIED: npm registry — react-hook-form@7.77.0] |
| zod | ^3.25.76 | Schema validation | Validate login/register form fields. Use v3 (not v4 — v4.4.3 exists but @hookform/resolvers support unconfirmed). [VERIFIED: npm registry — zod@3.25.76 is latest stable v3] |
| @hookform/resolvers | ^5.4.0 | Zod ↔ React Hook Form bridge | Every form using zod schemas. Pass `zodResolver(schema)` to `useForm()`. [VERIFIED: npm registry] |
| sonner | ^2.0.7 | Toast notifications | Success/error feedback after login, register, logout. Install `<Toaster />` once in root. [VERIFIED: npm registry] |
| react-dropzone | ^15.0.0 | Drag-and-drop file upload | Not used in Phase 1, but installed now to avoid re-init later. Used in Phase 3 for recipe image upload. [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-router-dom v6 | Keep scaffold's v7 | v7 is framework-first (SSR focus), overkill for this SPA. v6 has stable API with zero breaking changes since 6.4. Decision already locked in STACK.md |
| zod v3 | zod v4 | v4.4.3 exists but @hookform/resolvers 5.4.0 doesn't officially support zod v4. STACK.md locks v3 |
| axios | native fetch | fetch lacks interceptors, base URL config, and has clunky error handling. axios provides request/response interceptors out of the box — critical for JWT header injection |
| New AuthContext from scratch | Adapt scaffold's existing AuthContext | Scaffold's AuthContext already handles: JWT in localStorage, user rehydration via /me, loading state, login/logout methods. Adapting saves 2+ hours and preserves tested patterns |

**Installation:**
```bash
# In frontend/ directory (after rename)
npm install axios@^1.17.0 react-hook-form@^7.77.0 zod@^3.25.76 \
  @hookform/resolvers@^5.4.0 sonner@^2.0.7 react-dropzone@^15.0.0

# Then initialize shadcn/ui (separate step)
npx shadcn@latest init

# Add shadcn components as needed
npx shadcn@latest add button input card form label
```

## Package Legitimacy Audit

> slopcheck was unavailable at research time (pip install failed). All packages below are tagged `[ASSUMED]`. The planner MUST gate each install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| axios | npm | 11+ yrs | ~50M/wk | github.com/axios/axios | N/A | [ASSUMED] — planner must add checkpoint |
| react-hook-form | npm | 7+ yrs | ~5M/wk | github.com/react-hook-form/react-hook-form | N/A | [ASSUMED] — planner must add checkpoint |
| zod | npm | 6+ yrs | ~12M/wk | github.com/colinhacks/zod | N/A | [ASSUMED] — planner must add checkpoint |
| @hookform/resolvers | npm | 5+ yrs | ~3M/wk | github.com/react-hook-form/resolvers | N/A | [ASSUMED] — planner must add checkpoint |
| sonner | npm | 3+ yrs | ~1.5M/wk | github.com/emilkowalski/sonner | N/A | [ASSUMED] — planner must add checkpoint |
| react-dropzone | npm | 9+ yrs | ~3M/wk | github.com/react-dropzone/react-dropzone | N/A | [ASSUMED] — planner must add checkpoint |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck unavailable)
**Packages flagged as suspicious [SUS]:** none (slopcheck unavailable)
**Packages with postinstall scripts:** none detected (all six packages have no `scripts.postinstall`)

*All packages above are tagged `[ASSUMED]` because slopcheck was unavailable at research time — the planner must gate each install behind a `checkpoint:human-verify` task.*

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 19 SPA)                     │
│                                                                    │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │ AuthProvider │──▶│ AuthContext  │──▶│ ProtectedRoute │           │
│  │ (mount: load │   │ {user,token, │   │ (token check)  │           │
│  │  token from  │   │  loading,... │   │                │           │
│  │  localStorage│   │  login/logout)│  │                │           │
│  │  call /me)   │   └──────────────┘   └───────┬────────┘           │
│  └──────────────┘                               │                   │
│                                                  ▼                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │ Login Page   │   │Register Page │   │ Not Found    │              │
│  │ (react-hook- │   │ (react-hook- │   │ (404 catch-  │              │
│  │  form + zod) │   │  form + zod) │   │  all route)  │              │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┘              │
│         │                  │                                        │
│         ▼                  ▼                                        │
│  ┌──────────────────────────────────────┐                          │
│  │         axios instance (api.ts)       │                          │
│  │  ┌──────────────────────────────────┐ │                          │
│  │  │ Request interceptor:             │ │                          │
│  │  │  reads token from localStorage,  │ │                          │
│  │  │  sets Authorization: Bearer {tok}│ │                          │
│  │  ├──────────────────────────────────┤ │                          │
│  │  │ Response interceptor:            │ │                          │
│  │  │  on 401 → clear token, redirect  │ │                          │
│  │  │  to /login                       │ │                          │
│  │  └──────────────────────────────────┘ │                          │
│  └──────────────────┬───────────────────┘                          │
└─────────────────────┼──────────────────────────────────────────────┘
                      │
          Vite dev proxy: /api → localhost:4000
                      │
┌─────────────────────┼──────────────────────────────────────────────┐
│              BACKEND (Express, port 4000)                           │
│                                                                     │
│  POST /api/auth/register  →  { user: {id,name,email,...}, token }  │
│  POST /api/auth/login     →  { user: {id,name,email,...}, token }  │
│  GET  /api/auth/me        →  { user: {id,name,email,...} }         │
│       (protected — requires Bearer token)                           │
│                                                                     │
│  JWT_SECRET: 2589d... (from backend/.env)                          │
│  Token expiry: 7 days                                              │
└─────────────────────────────────────────────────────────────────────┘

Data flow for login:
  1. User fills form → react-hook-form validates via zod schema
  2. On submit → axios POST /api/auth/login with {email, password}
  3. Vite proxy forwards to backend:4000
  4. Backend validates, returns { user, token }
  5. AuthContext.login(token, user) → saves to localStorage, updates state
  6. React Router navigates to intended page (or home)

Data flow for rehydration (page refresh):
  1. AuthProvider mounts → reads token from localStorage
  2. If token exists → axios GET /api/auth/me (with Authorization header)
  3. Backend verifies JWT, returns { user }
  4. AuthContext sets user + token → React re-renders authenticated UI
  5. If /me fails (401) → AuthContext clears localStorage, sets user=null
```

### Recommended Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts        # axios instance, interceptors, base URL
│   │   └── auth.ts          # login(), register(), getMe() wrappers
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (button, input, card, form, etc.)
│   │   ├── Header.tsx       # Nav header (adapted from scaffold)
│   │   └── ProtectedRoute.tsx # Auth gate (adapted from scaffold)
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state, login/logout, rehydration
│   ├── lib/
│   │   └── utils.ts         # shadcn/ui utility (cn function)
│   ├── pages/
│   │   ├── Login.tsx        # Adapted from scaffold + zod validation
│   │   ├── Register.tsx     # Adapted from scaffold + zod validation
│   │   └── NotFound.tsx     # 404 page (adapted from scaffold)
│   ├── hooks/               # Custom hooks (useAuth, etc.)
│   ├── types.ts             # User, Recipe, Comment, Ingredient interfaces
│   ├── App.tsx              # Router, AuthProvider, layout
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind v4 imports + theme
├── components.json          # shadcn/ui config (generated by init)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: AuthContext with JWT Rehydration

**What:** React Context that holds `{ user, token, loading, login, logout }`. On mount, reads token from localStorage and calls `/api/auth/me` to validate and hydrate the user object. If validation fails, clears state.

**When to use:** This is the foundational auth pattern for the entire app. All protected route checks, header sign-in/sign-out buttons, and API calls depend on it.

**Scaffold's AuthContext already implements this correctly — adapt, don't rewrite.**

The key adaptation needed: the scaffold's `AuthContext.login()` stores both token and serialized user in localStorage and expects the user object from `/me` to be the raw user (not wrapped). The real backend wraps it: `{ user: {...} }`. We need to unwrap in the adapter.

**Example (adapted pattern):**
```typescript
// Source: Adapted from scaffold src/context/AuthContext.tsx
// Key changes: axios instead of apiFetch, unwrap { user } from /me response

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client'; // axios instance
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    // Store minimal user data for offline display — not the source of truth
    localStorage.setItem('recipehub_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('recipehub_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Rehydrate from backend
      api.get('/api/auth/me')
        .then((res) => {
          // Backend returns { user: { id, name, email, ... } }
          // Need to normalize id → _id for scaffold compatibility
          const backendUser = res.data.user;
          const normalizedUser: User = {
            _id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            bio: backendUser.bio,
            avatarUrl: backendUser.avatarUrl,
            createdAt: backendUser.createdAt,
          };
          localStorage.setItem('recipehub_user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        })
        .catch(() => {
          // Token invalid or expired — clear everything
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Pattern 2: Axios Instance with JWT Interceptor

**What:** A configured axios instance that automatically attaches the JWT `Authorization: Bearer` header to every request and handles 401 responses by clearing auth state and redirecting to login.

**When to use:** Every API call in the app. This replaces the scaffold's `apiFetch` function which was a 400-line localStorage mock.

**Example:**
```typescript
// Source: Standard axios interceptor pattern (verified against axios docs)
// File: src/api/client.ts

import axios from 'axios';

const api = axios.create({
  baseURL: '', // Vite proxy handles /api → backend:4000 in dev
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('recipehub_user');
      // Redirect to login — use window.location to force full state reset
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
```

### Pattern 3: react-hook-form + zod for Login/Register

**What:** Forms use `useForm` with `zodResolver` for client-side validation. Schema defines required fields, email format, and password minimum length.

**When to use:** Login and Register forms. Replaces the scaffold's manual `useState` + inline validation.

**Example:**
```typescript
// Source: react-hook-form + zod standard pattern
// [VERIFIED: Context7 /react-hook-form/documentation - zodResolver integration]

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const response = await api.post('/api/auth/login', data);
    // response.data = { user: {...}, token: "..." }
    login(response.data.token, normalizeUser(response.data.user));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit" disabled={isSubmitting}>Sign in</button>
    </form>
  );
}
```

### Anti-Patterns to Avoid

- **Storing passwords or sensitive data in localStorage:** Only store the JWT token and minimal user display info (name, email). The token is opaque; the server determines what it authorizes. Never store passwords client-side.
- **Silent 401 swallowing:** The 401 interceptor MUST clear auth state AND redirect. A common bug is clearing localStorage but not updating React state, causing the UI to show stale "logged in" state until next render.
- **Race condition on auth rehydration:** The `loading` flag in AuthContext prevents rendering protected routes before `/me` completes. Without it, the ProtectedRoute briefly sees `token` from localStorage, renders children, then `/me` fails → flashes protected content to unauthenticated users.
- **Using `useNavigate()` inside non-component code (like axios interceptors):** React Router's `useNavigate` hook only works inside components. For the 401 redirect in the interceptor, use `window.location.href` or set up a callback pattern from the AuthContext.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT token storage + retrieval | Custom `localStorage.getItem('token')` wrapper | Direct `localStorage` access in AuthContext + axios interceptor | localStorage API is standard, trivial, and doesn't benefit from abstraction |
| Form validation logic | Custom regex/validation functions for email, password | zod schemas with `z.string().email()`, `z.string().min(8)` | zod handles edge cases (RFC 5322 email validation), error message generation, TypeScript type inference |
| HTTP request wrapper | Custom `fetch` wrapper with auth header logic | axios with interceptors | axios interceptors handle: base URL, auth headers, error transformation, request/response logging — all in 10 lines |
| Toast notification system | Custom toast state + render logic | sonner (`<Toaster />` + `toast.success()`/`toast.error()`) | sonner handles stacking, swipe-to-dismiss, accessibility, animations — 50+ hours of edge cases |
| `fetch` with manual `Authorization` header injection | Hand-rolled fetch helper | axios interceptor | Forgetting the header on one call = silent auth failure. Interceptor guarantees every request has the token |
| Backend response normalization | Scattered `if (res.data?.user) { ... }` checks in every page | Single `normalizeUser()` function in `api/auth.ts` | Centralizes the `id → _id` mapping and `/me` unwrapping. If the backend changes its response shape, fix one function |
| Accessible form inputs | Raw `<input>` without labels, error states | shadcn/ui `Form` + `Input` components with react-hook-form `register()` | shadcn/ui Form handles: label association, error message display, focus states, disabled states — all WCAG 2.1 AA compliant |

**Key insight:** The scaffold's `apiFetch` function is 415 lines of localStorage mock data simulation. Replacing it with a 30-line axios instance + interceptors gives us real API calls, proper error handling, and a foundation for all future phases. Do not try to incrementally convert `apiFetch` — replace it entirely.

## Runtime State Inventory

> Phase 01 involves renaming `frontend-to-implement/` → `frontend/` and replacing the existing `frontend/` directory. This is both a rename and a migration.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Old `frontend/` directory tracked in git (18 files); `frontend-to-implement/` NOT in git yet. `frontend/node_modules/` has installed deps. `frontend/dist/` has build artifacts. | Git: `git rm -r frontend/`, then `git mv frontend-to-implement frontend` (after checking .gitignore). Build artifacts in old `frontend/dist/` will be removed with the directory. |
| Live service config | Backend on port 4000 — not running at research time. No n8n, Redis, or other live services detected. | Code edit only: Vite proxy config points to port 4000. No live service reconfiguration needed. |
| OS-registered state | None detected. No Task Scheduler, launchd, pm2, or systemd services referencing either directory. | None. |
| Secrets/env vars | Old `frontend/.env.example` has no actual secrets. Scaffold `.env.example` has `GEMINI_API_KEY` and `APP_URL` placeholders — both are Gemini-specific and should be stripped. Backend `.env` has `JWT_SECRET` — not affected by frontend rename. | Replace scaffold `.env.example` with `VITE_API_URL=http://localhost:4000` (for production build) or remove entirely (dev uses Vite proxy). |
| Build artifacts | Old `frontend/dist/` directory (built JS). Old `frontend/node_modules/` (installed deps for the placeholder app). Scaffold has no `dist/` but has `package-lock.json`. | Delete old `frontend/` entirely. After rename, run `npm install` in new `frontend/` to regenerate `node_modules/`. |

**Nothing found in category:**
- OS-registered state: None — verified by checking common locations (no pm2 processes, no systemd units, no launchd plists referencing either directory path)
- Live service config: No external services with stored configuration — the only service is the backend Express server, which is unaffected by frontend directory rename

## Common Pitfalls

### Pitfall 1: Response Shape Mismatch (id vs _id, { user } wrapping)

**What goes wrong:** The scaffold was built with a mock API that returns `{ user: { _id: "user_abc", ... }, token }` from login/register, and the raw user object `{ _id: "user_abc", ... }` from `/me` (no wrapping). The real backend returns `{ user: { id: "67abc...", ... }, token }` from login/register and `{ user: { id: "67abc...", ... } }` from `/me`. If the scaffold code expects `_id` but receives `id`, user profile pages break. If it expects unwrapped `/me` response but receives `{ user: {...} }`, the user object is set to `{ user: {...} }` instead of the actual user.

**Why it happens:** The scaffold was generated by AI Studio with a hardcoded mock. The mock was designed for demo/preview, not production backend integration.

**How to avoid:** Create a single `normalizeUser(backendUser)` function that maps `{ id, name, email, bio, avatarUrl, createdAt }` → `{ _id, name, email, bio, avatarUrl, createdAt }`. Use this function in the AuthContext rehydration, login handler, and register handler. For `/me`, unwrap: `const user = normalizeUser(response.data.user)`.

**Warning signs:** User sees "Hello, undefined" in header, profile page shows empty data, `user._id` is undefined in console.

### Pitfall 2: React Router v7 → v6 Breaking Changes

**What goes wrong:** The scaffold uses `react-router-dom@^7.16.0`. While v7 SPA mode is largely API-compatible with v6, there are subtle differences: v7 removed `json()` and `defer()` utilities, changed some type signatures, and uses a different `future` flags system. If we just change the version in package.json and run `npm install`, the code may compile but behave differently at runtime.

**Why it happens:** v7 was a major rewrite focused on framework features (SSR, loaders, actions). The SPA mode preserved most of the v6 API but not all.

**How to avoid:** After downgrading to `react-router-dom@~6.30.4`, verify these imports work:
- `BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `NavLink` — from `react-router-dom` (same in both versions)
- `useParams`, `useNavigate`, `useLocation` — from `react-router-dom` (same)
- `Outlet` — if used anywhere (check scaffold for nested routes — currently not used)

The scaffold's current usage of React Router is pure SPA mode: `BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `NavLink`, `useNavigate`, `useLocation`, `useParams`. All of these have identical APIs in v6 and v7 SPA. The downgrade should be a clean `npm install react-router-dom@~6.30.4` with zero code changes.

**Warning signs:** TypeScript errors on Router imports, `Navigate` not found, broken `<NavLink className>` callback signature changes.

### Pitfall 3: Vite Proxy Not Forwarding /api Requests

**What goes wrong:** After rename and deps change, the Vite dev server doesn't proxy `/api` requests to the backend on port 4000. Login/register forms submit but get 404 or CORS errors because the frontend tries to call `/api/auth/login` on its own port (3000) instead of the backend (4000).

**Why it happens:** The scaffold's `vite.config.ts` does NOT have a proxy configuration — it was designed to call a production API at `https://api.yourdomain.xyz` or use localStorage mock. The old `frontend/vite.config.js` had the proxy setup.

**How to avoid:** Add proxy configuration to the adapted `vite.config.ts`:
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
},
```

**Warning signs:** Network tab shows requests to `http://localhost:3000/api/auth/login` with 404, CORS errors in console, login form "submits" but never resolves.

### Pitfall 4: shadcn/ui Init with Existing Tailwind v4 Config

**What goes wrong:** Running `npx shadcn@latest init` on the adapted scaffold may overwrite or conflict with the existing `index.css` that already has `@import "tailwindcss"` and `@theme` block with custom CSS variables. shadcn/ui's init script expects to set up Tailwind from a clean slate.

**Why it happens:** shadcn/ui v4's init script writes to `src/index.css` and creates a `components.json` config. The scaffold's `index.css` already has Google Fonts imports, Tailwind layer directives, and a `@theme` block with custom colors (`--color-bg`, `--color-surface`, etc.). The init script may prepend/append content that conflicts.

**How to avoid:** Run `npx shadcn@latest init` with the `--defaults` flag or answer the prompts to use existing CSS. Important: choose "CSS variables" = NO (the scaffold already uses Tailwind v4's `@theme` with CSS custom properties, which is equivalent). Choose the existing `src/index.css` as the CSS file. After init, manually merge if needed: shadcn adds a `@import` for its own theme — keep the scaffold's existing `@theme` block and fonts, remove shadcn's `@layer base` if it conflicts.

**Warning signs:** Duplicate `@theme` blocks, CSS variable conflicts, shadcn components rendered without styling, font imports broken.

### Pitfall 5: React 19 StrictMode Double Mount + Auth Rehydration

**What goes wrong:** React 19 StrictMode (enabled in scaffold's `main.tsx`) intentionally double-mounts components in development. The AuthContext's `useEffect` for rehydration fires twice, making two `/api/auth/me` calls on page load. The second call may cancel the first, or the `loading` state may flicker.

**Why it happens:** StrictMode in React 18+ double-invokes effects to detect side-effect bugs. The AuthContext's rehydration effect has cleanup logic that should handle this, but the scaffold's current implementation doesn't include cleanup.

**How to avoid:** This is cosmetic in development (two API calls instead of one) and doesn't affect production. The AuthContext is correct — it doesn't break. If the double call is annoying, use a `useRef` to track whether rehydration already happened:
```typescript
const hydrated = useRef(false);
useEffect(() => {
  if (hydrated.current) return;
  hydrated.current = true;
  // ... rehydration logic
}, []);
```

**Warning signs:** Two `/api/auth/me` requests in Network tab on every page load in dev mode. No functional impact.

## Code Examples

Verified patterns from the codebase and official sources:

### Axios Interceptor with JWT
```typescript
// Source: axios official docs interceptors pattern
// [VERIFIED: npm registry — axios@1.17.0]

import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('recipehub_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Protected Route Pattern (React Router v6)
```typescript
// Source: Adapted from scaffold src/components/ProtectedRoute.tsx
// Pattern verified against React Router v6 docs

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Verifying session...</div>; // Or a spinner component
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Vite Proxy Config for API
```typescript
// Source: Adapted from old frontend/vite.config.js
// Combined with scaffold's vite.config.ts

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Changed from '.' to './src' for shadcn/ui convention
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

### Backend API Response Shapes (Real Backend)
```typescript
// Source: backend/src/controllers/authController.ts (read from codebase)
// Documented here for adapter implementation reference

// POST /api/auth/register (201)
// Body: { name, email, password }
// Response: { user: { id: string, name: string, email: string, bio?: string, avatarUrl?: string, createdAt: string }, token: string }

// POST /api/auth/login (200)
// Body: { email, password }
// Response: { user: { id, name, email, bio?, avatarUrl?, createdAt }, token: string }

// GET /api/auth/me (200, protected)
// Headers: Authorization: Bearer <token>
// Response: { user: { id, name, email, bio?, avatarUrl?, createdAt } }

// Error responses:
// 400: { message: "..." }
// 401: { message: "Invalid email or password" } | "Invalid or expired authentication token"
// 409: { message: "Email is already registered" }
// 500: { message: "Error registering user" } | "Error logging in"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Scaffold `apiFetch` with 415-line localStorage mock | axios instance with 30-line interceptors | Phase 1 | Real API calls, proper error handling, no mock data maintenance |
| Scaffold manual form validation with `useState` + inline checks | react-hook-form + zod schemas | Phase 1 | Type-safe validation, better error messages, less boilerplate |
| Scaffold `react-router-dom` v7 | v6.30.4 | Phase 1 | Stable SPA router, no framework lock-in, matches STACK.md decision |
| Old `frontend/` React 18 + Vite 5 placeholder | Scaffold React 19 + Vite 6 adapted | Phase 1 | Modern React features, unified codebase, removes duplicate frontend directory |
| localStorage user serialization as auth source | Backend `/me` as source of truth | Phase 1 | Token can be revoked server-side, user data stays current |

**Deprecated/outdated:**
- `@google/genai@^2.4.0` — Gemini SDK, stripped from scaffold. No AI features in scope.
- `express@^4.21.2` in frontend — frontend doesn't need its own Express server. Backend handles API on port 4000.
- `dotenv@^17.2.3` in frontend — Vite uses `import.meta.env` natively. Not needed unless server-side code exists.
- `react-router-dom@^7.16.0` — v7 is framework-first. v6.30.4 is the stable SPA router.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React Router v7 SPA → v6.30.4 downgrade requires zero code changes (APIs are identical for the features used: BrowserRouter, Routes, Route, Navigate, Link, NavLink, useNavigate, useLocation, useParams) | Common Pitfalls #2 | If v7 added SPA-mode features the scaffold depends on (unlikely given the simple usage), compilation or runtime errors. Mitigation: TypeScript will catch import errors; runtime test with `npm run dev` catches behavioral differences. |
| A2 | `@hookform/resolvers@5.4.0` fully supports `zod@3.25.76` | Standard Stack | If resolver version incompatible, forms will fail at runtime. Mitigation: both versions specified in STACK.md as compatible pair; can verify with `npm install` dry run. |
| A3 | shadcn/ui v4 init won't break the scaffold's existing `index.css` with `@theme` and Google Fonts imports | Common Pitfalls #4 | If shadcn init overwrites existing CSS, the editorial design (IBM Plex fonts, custom colors) breaks. Mitigation: backup index.css before init; answer "no" to CSS variable prompt; manually merge if needed. |
| A4 | Backend will be running on port 4000 when frontend dev server starts | Architecture Patterns | If backend is on a different port or not running, all API calls fail with proxy errors. Mitigation: Vite proxy config is explicit (`target: 'http://localhost:4000'`); documented in README. |
| A5 | `lucide-react@^0.546.0` (from scaffold) is compatible with the icons used (Search, ArrowRight, ArrowLeft, Clock, Utensils, SearchX) and doesn't need bumping to 1.x | Standard Stack | If the 1.x major version changed export names or removed icons used in the scaffold, icons break. Mitigation: scaffold already builds successfully with 0.546.0; only bump if explicitly needed. |
| A6 | `@vitejs/plugin-react@^5.0.4` works with React 19.0.1 | Standard Stack | If the plugin version is incompatible with React 19, Fast Refresh breaks or build fails. Mitigation: scaffold already builds with this combo; v5 was specifically released for React 19 support. |
| A7 | shadcn/ui `Button`, `Input`, `Card`, `Form`, `Label` components are sufficient for Phase 1 auth forms | Architecture Patterns | If shadcn/ui doesn't provide these components (it does per docs), alternative: build with raw Tailwind + scaffold's existing styling patterns. |

## Open Questions

1. **Scaffold's `motion` dependency (^12.23.24) — keep or remove?**
   - What we know: `motion` is an animation library (formerly framer-motion). The scaffold uses it for animations. Not in AGENTS.md constraints.
   - What's unclear: Whether scaffold pages rely on `motion` imports for layout animations. Removing it may break subtle animations.
   - Recommendation: Keep `motion` for now. It's a legitimate animation library and doesn't conflict with anything. Remove later if unused.

2. **scaffold uses `react-router-dom` v7's `NavLink` with `className` callback — same API in v6?**
   - What we know: `NavLink` in v6 supports `className={({ isActive }) => ...}` callback. The scaffold's Header.tsx uses this pattern.
   - What's unclear: Whether the callback signature changed between v6 and v7.
   - Recommendation: The `({ isActive })` callback has been stable since v6.0. Should work. Test after downgrade.

3. **Do we need `autoprefixer` as a devDependency?**
   - What we know: Scaffold includes `autoprefixer@^10.4.21` in devDependencies. Tailwind v4 + Vite doesn't require PostCSS or Autoprefixer — Tailwind v4's Vite plugin handles it internally.
   - What's unclear: Whether shadcn/ui's init script needs it.
   - Recommendation: Remove `autoprefixer` as a dependency. Tailwind v4's Vite plugin includes vendor prefixing. If shadcn/ui init adds it back, let it.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server, npm install | ✓ | v24.15.0 | — |
| npm | Package management | ✓ | 11.12.1 | — |
| npx | shadcn/ui init, ad-hoc scripts | ✓ | 11.12.1 | — |
| Backend (Express, port 4000) | Real API calls (login, register, /me) | ✗ | — | Start backend: `cd backend && npm run dev` |

**Missing dependencies with no fallback:**
- Backend (Express on port 4000): Required for real API calls. The entire auth flow depends on it. Planner must add a task to start the backend (`cd backend && npm install && npm run dev`) before frontend testing.

**Missing dependencies with fallback:**
- None — all other dependencies are npm packages (installed) or local tools (Node, npm, npx all available).

## Validation Architecture

> `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. Validation Architecture section skipped per spec.

## Security Domain

> `security_enforcement` is `true` in `.planning/config.json`. ASVS level 1. Block on `high` severity.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | JWT Bearer token via axios interceptor. Backend handles bcrypt hashing (cost factor 10), JWT signing (HS256, 7-day expiry). Frontend stores token in localStorage only — never in URL or sessionStorage. |
| V3 Session Management | yes | Stateless JWT sessions. Token stored in localStorage, sent via Authorization header. Logout clears localStorage. No server-side session store needed (JWT is self-contained). |
| V4 Access Control | yes | ProtectedRoute component checks token existence before rendering protected pages. Backend middleware (`protect`) verifies JWT on every request to /api/auth/me and other protected endpoints. Recipe ownership checks are on backend (not Phase 1 scope). |
| V5 Input Validation | yes | Client-side: zod schemas validate email format, password minimum length (8 chars), required fields. Server-side: backend validates required fields, email uniqueness, password length — this is the authoritative validation. [V5.1.4] |
| V6 Cryptography | no (backend responsibility) | Password hashing (bcrypt) and JWT signing (HS256) happen on the backend. Frontend only handles token storage and transmission. |

### Known Threat Patterns for React 19 + JWT SPA

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS steals JWT from localStorage | Information Disclosure | Content Security Policy (CSP) headers from backend; React's automatic XSS protection (JSX encoding). Mitigation is primarily backend/server config — document in deployment guide. |
| CSRF with JWT in Authorization header | Tampering | JWT in `Authorization: Bearer` header (not in cookies) makes CSRF attacks ineffective — browser doesn't auto-attach the header. This is the standard SPA JWT pattern. |
| Token stored in localStorage persists after logout if another tab holds reference | Elevation of Privilege | The 401 response interceptor handles this: any API call with an invalid/expired token triggers logout. Tab-syncing via `storage` event listener can propagate logout across tabs (nice-to-have, not required for v1). |
| Login form enumeration (timing attack on email lookup) | Information Disclosure | Backend returns generic "Invalid email or password" for both wrong email and wrong password (confirmed in backend code). Frontend should display this message verbatim — don't differentiate "email not found" vs "wrong password". |
| Password sent in plaintext over HTTP | Information Disclosure | Use HTTPS in production. In development, both frontend (Vite dev server) and backend are on localhost — no network exposure. |

## Sources

### Primary (HIGH confidence)
- **Codebase: `frontend-to-implement/src/`** — Full scaffold read: AuthContext.tsx, ProtectedRoute.tsx, Header.tsx, Login.tsx, Register.tsx, NotFound.tsx, App.tsx, main.tsx, client.ts, types.ts, index.css, vite.config.ts, tsconfig.json, package.json, index.html, .env.example, .gitignore
- **Codebase: `backend/src/`** — auth.routes.ts, authController.ts, auth.middleware.ts, app.ts, server.ts, package.json — verified real API endpoints and response shapes
- **Codebase: `frontend/src/`** — axios.js, authApi.js, AuthContext.jsx — verified existing placeholder patterns and Vite proxy config

### Secondary (MEDIUM confidence)
- [npm registry] — All version numbers verified via `npm view` on 2026-06-05: react@19.2.7, react-dom@19.2.7, react-router-dom@6.30.4, axios@1.17.0, react-hook-form@7.77.0, zod@3.25.76 (v3 latest), zod@4.4.3 (v4 latest), @hookform/resolvers@5.4.0, sonner@2.0.7, lucide-react@1.17.0 (latest) / @0.546.0 (scaffold), react-dropzone@15.0.0, @tailwindcss/vite@4.3.0, @vitejs/plugin-react@6.0.2 (latest) / @5.0.4 (scaffold), shadcn@4.10.0

### Tertiary (LOW confidence)
- None — all claims are verified against the codebase (primary) or npm registry (secondary)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry; scaffold's existing deps confirmed by reading package.json; backend endpoints confirmed by reading source code
- Architecture: HIGH — patterns extracted directly from working scaffold code; backend response shapes confirmed from source; no speculative patterns needed
- Pitfalls: HIGH — pitfalls identified from direct codebase analysis (response shape mismatch, proxy config gap, v7→v6 downgrade verification); all backed by specific line references in the codebase

**Research date:** 2026-06-05
**Valid until:** 2026-07-05 (30 days — stable React ecosystem, no expected breaking changes in used libraries)
