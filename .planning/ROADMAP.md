# Roadmap: RecipeHub Frontend

## Overview

RecipeHub frontend is built from an AI Studio-generated scaffold (`frontend-to-implement/`) — a React 19 + TypeScript + Tailwind v4 app. The scaffold already has working (mock) pages: recipe feed, detail, create/edit, profile, auth, and a full mock API client. This roadmap adapts the scaffold to connect to the real backend, replace mock with real API calls, add shadcn/ui components, implement proper form handling with react-hook-form + Zod, add image upload, and polish the UX. Each phase delivers a vertical slice — a complete end-to-end user capability.

## Phases

- [ ] **Phase 1: Foundation & Authentication** — Adapt scaffold, configure real API, auth UI with real backend
- [ ] **Phase 2: Browse & Discover** — Recipe feed, filtering/search, detail page, comments with ratings
- [ ] **Phase 3: Recipe Management** — Create/edit/delete recipes with dynamic forms and image upload
- [ ] **Phase 4: Polish & UX** — Responsive design audit, loading/empty/error states across all views

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: Users can sign up, sign in, and navigate a responsive app shell with protected routes, ready for feature development
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, UX-05
**Success Criteria** (what must be TRUE):
  1. The app runs on localhost, serving from the adapted scaffold without Express or @google/genai dependencies
  2. User can register with email and password and receive a JWT token from the real backend
  3. User can log in and remain logged in across page refreshes (JWT persisted and verified)
  4. User can log out from any page and be redirected to the home page
  5. Unauthenticated users are redirected to login when accessing protected routes, and a 404 page appears for invalid routes
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 01-01: Scaffold adaptation — strip Express/Gemini, install deps, init shadcn/ui, rename directory
- [ ] 01-02: API client — axios with base URL, JWT interceptor, real endpoint integration
- [ ] 01-03: Auth UI — login/register forms connected to real backend, protected route gating, logout

### Phase 2: Browse & Discover
**Goal**: Users can browse, filter, search, and view recipes with full detail including comments with star ratings
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: BROWSE-01, BROWSE-02, BROWSE-03, BROWSE-04, SOCIAL-01, SOCIAL-02, SOCIAL-03, UX-06, UX-07
**Success Criteria** (what must be TRUE):
  1. User sees a responsive grid of recipe cards on the home page with image, title, author, color-coded difficulty badge, and cook time
  2. User can filter recipes by category and difficulty, and search by free-text with debounced input and URL query param sync
  3. User can navigate to a recipe detail page showing hero image, ingredients with interactive checklist, numbered steps, author info, and time/servings summary bar
  4. User can view comments with star ratings on any recipe detail page
  5. Authenticated user can post a comment with star rating, and recipe author can delete comments on their recipe
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 02-01: Recipe feed — card grid with responsive layout, difficulty badges, loading skeletons
- [ ] 02-02: Filtering & search — category/difficulty selects, debounced search, URL query param sync
- [ ] 02-03: Recipe detail & comments — hero image, ingredient checklist, steps, comment list, post/delete comments

### Phase 3: Recipe Management
**Goal**: Users can create, edit, and delete their own recipes with dynamic forms, validation, and image upload
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: RECIPE-01, RECIPE-02, RECIPE-03, RECIPE-04, RECIPE-05, RECIPE-06, UX-03
**Success Criteria** (what must be TRUE):
  1. User can create a new recipe via a multi-field form with dynamic ingredient rows and step list (add/remove)
  2. User sees inline field validation errors and toast notifications on form submission success or failure
  3. User can upload a recipe image via drag-and-drop with preview before submitting
  4. User can edit an existing recipe with a pre-populated form showing all current values
  5. User can delete their own recipe with confirmation
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 03-01: Create/edit recipe form — RHF + Zod, shadcn/ui Form components, useFieldArray for dynamic rows
- [ ] 03-02: Image upload — react-dropzone, drag-and-drop zone, file preview, backend upload endpoint
- [ ] 03-03: Edit/delete flows — pre-populated edit form, delete with confirmation, toast notifications

### Phase 4: Polish & UX
**Goal**: The app is fully responsive with consistent loading, empty, and error states across all views
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: UX-01, UX-02, UX-04
**Success Criteria** (what must be TRUE):
  1. All pages render correctly across mobile (1-col), tablet (2-col), and desktop (3-col) breakpoints
  2. All data-fetching views show loading skeleton grids or spinners while data loads (no blank screens)
  3. All list/feed views show friendly empty state messages with clear calls to action when no data exists
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 04-01: Responsive design audit — verify all pages at mobile/tablet/desktop, fix layout breakages
- [ ] 04-02: Loading & empty states — consistent skeleton/spinner patterns, empty state messages across all views

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 0/3 | Not started | - |
| 2. Browse & Discover | 0/3 | Not started | - |
| 3. Recipe Management | 0/3 | Not started | - |
| 4. Polish & UX | 0/2 | Not started | - |
