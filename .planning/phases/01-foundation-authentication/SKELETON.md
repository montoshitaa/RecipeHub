# Walking Skeleton — RecipeHub

**Phase:** 1
**Generated:** 2026-06-05

## Capability Proven End-to-End

A user can register an account with email and password, log in, see their name in the navigation header, log out, be redirected to login when accessing protected routes, and see a 404 page for invalid routes — all served from a single Vite dev server that proxies API calls to the real Express backend on port 4000.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript + Vite 6 | Adopted from AI Studio-generated scaffold (`frontend-to-implement/`). React 19 provides modern primitives; Vite 6 delivers fast HMR with native ESM. |
| Routing | react-router-dom v6.30.4 (downgraded from scaffold's v7) | v6 is the stable SPA router with zero breaking changes since 6.4. v7 is framework-first (SSR focus) — overkill for this SPA. All APIs used (BrowserRouter, Routes, Route, Navigate, Link, NavLink, useNavigate, useLocation, useParams) are identical in both versions. |
| Styling | Tailwind CSS v4.3.0 via @tailwindcss/vite plugin | Native Vite integration; no PostCSS config needed. Custom design tokens defined in `@theme` block in `src/index.css`. Brutalist/editorial aesthetic: IBM Plex fonts, square corners (softened for shadcn components), off-white warm background. |
| Component library | shadcn/ui v4 (copy-paste, not npm) | Components live in `src/components/ui/` — we own the code. Init via `npx shadcn@latest init`, add via `npx shadcn@latest add`. Used for Button, Input, Card, Form, Label in Phase 1. |
| Forms | react-hook-form v7.77 + zod v3.25.76 | Industry standard. RHF provides uncontrolled form state with minimal re-renders. Zod provides TypeScript-first validation with static type inference. Bridge via `@hookform/resolvers/zod`. |
| HTTP client | axios v1.17.0 with request/response interceptors | Replaces scaffold's 415-line localStorage mock `apiFetch`. Request interceptor attaches JWT from localStorage. Response interceptor handles 401 globally (clear auth, redirect to /login). |
| Auth | JWT Bearer token via Authorization header | Token stored in localStorage (key: `token`), sent on every request via axios interceptor. Rehydration on mount via GET /api/auth/me. Logout clears localStorage + React state. Backend handles bcrypt hashing (cost factor 10), JWT signing (HS256, 7-day expiry). |
| Backend proxy | Vite dev server proxy (`/api` → `localhost:4000`) | No CORS issues in development. Production would use same-domain deployment or CORS configuration. |
| Toasts | sonner v2.0.7 | `<Toaster />` mounted once in App.tsx. `toast.success()` / `toast.error()` called from auth pages. |
| Icons | lucide-react v0.546.0 (kept from scaffold) | Tree-shakeable per-icon imports. Used for ArrowRight, ArrowLeft, SearchX in Phase 1. |
| Directory layout | Feature-adjacent flat: `src/{api,components,context,pages,hooks,lib}/` | Kept from scaffold structure. Not feature-folders (e.g., `src/features/auth/`) but pragmatic for a project this size. `@/` alias maps to `src/` via Vite resolve config. |

## Stack Touched in Phase 1

- [x] Project scaffold — Adapted from `frontend-to-implement/`, renamed to `frontend/`, stripped of Express/Gemini/dotenv/autoprefixer
- [x] Routing — React Router v6 with `/`, `/login`, `/register`, `/new`, `/edit/:id`, `/profile`, `*` (404)
- [x] Real API read/write — POST `/api/auth/register` (write), POST `/api/auth/login` (read/write), GET `/api/auth/me` (read)
- [x] UI wired to API — Login and Register forms connect to real backend via axios; AuthContext rehydrates user on page refresh
- [x] Local-run command — `cd backend && npm run dev` (port 4000), then `cd frontend && npm run dev` (port 3000), open `http://localhost:3000`

## Out of Scope (Deferred to Later Slices)

- Password reset / forgot password flow
- Email verification
- OAuth / social login (Google, GitHub)
- Multi-tenancy / role-based access control
- Recipe browsing, filtering, search (Phase 2)
- Recipe create, edit, delete (Phase 3)
- Image upload (Phase 3)
- Comment posting and rating (Phase 2)
- Responsive design audit (Phase 4)
- Loading skeletons, empty states (Phase 4)
- Profile editing (future)
- Global state library (Redux, Zustand) — React Context + API calls suffice
- Backend changes — backend is ready and unchanged

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2: Browse & Discover** — Recipe feed with cards, filtering/search, detail page, comments with star ratings
- **Phase 3: Recipe Management** — Create/edit/delete recipes, dynamic ingredient/step forms, image upload with drag-and-drop
- **Phase 4: Polish & UX** — Responsive design audit, consistent loading/empty/error states across all views
