# Requirements: RecipeHub Frontend

**Defined:** 2026-06-04
**Core Value:** Users can discover, create, and share recipes through a polished, responsive web interface

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Recipe Browsing

- [ ] **BROWSE-01**: User can browse a feed of recipe cards in a responsive grid layout (image, title, author, difficulty badge, cook time)
- [ ] **BROWSE-02**: User can filter recipes by category, difficulty, and tags
- [ ] **BROWSE-03**: User can search recipes by free-text with debounced input (300ms) and URL query param sync
- [ ] **BROWSE-04**: User can view a full recipe detail page (hero image with overlay gradient, ingredients list, numbered steps, author info, time/servings summary bar)

### Recipe Management

- [ ] **RECIPE-01**: User can create a new recipe via multi-field form (title, description, category, difficulty, cook time, servings)
- [ ] **RECIPE-02**: User can add dynamic ingredient rows (name, quantity, unit) via form
- [ ] **RECIPE-03**: User can add dynamic step list (ordered instructions) via form
- [ ] **RECIPE-04**: User can upload recipe image with drag-and-drop preview (react-dropzone)
- [ ] **RECIPE-05**: User can edit an existing recipe (pre-populated form with all fields)
- [ ] **RECIPE-06**: User can delete their own recipe

### Comments & Ratings

- [ ] **SOCIAL-01**: User can view comments with star ratings on recipe detail page
- [ ] **SOCIAL-02**: User can post a comment with star rating on a recipe
- [ ] **SOCIAL-03**: Author can delete comments on their recipe

### Authentication

- [x] **AUTH-01**: User can register with email and password
- [x] **AUTH-02**: User can log in and stay logged in across sessions (JWT stored)
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: Unauthenticated users are redirected to login for protected routes

### UI/UX Polish

- [ ] **UX-01**: App is fully responsive across mobile, tablet, and desktop breakpoints
- [x] **UX-02**: All data-fetching views show loading skeleton or spinner states
- [ ] **UX-03**: All forms show inline field validation errors and toast notifications on submit
- [x] **UX-04**: Empty states show friendly messages when no data exists (empty feed, no comments, etc.)
- [x] **UX-05**: 404 page shown for invalid routes
- [ ] **UX-06**: Difficulty badges use color coding (Easy=green, Medium=yellow, Hard=red)
- [ ] **UX-07**: Ingredient checklist on detail page (check off as you cook, local state only)

### Setup & Integration

- [x] **SETUP-01**: Adapt frontend-to-implement/ scaffold — strip Express server and @google/genai
- [x] **SETUP-02**: Install and configure additional dependencies (shadcn/ui init, react-hook-form, zod, react-dropzone, sonner, axios)
- [x] **SETUP-03**: Configure API client with base URL, JWT interceptor for auth headers
- [x] **SETUP-04**: Rename/move scaffold to become the project frontend directory

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social Enhancements

- **SOCIAL-04**: User can follow other users
- **SOCIAL-05**: User can like recipes
- **SOCIAL-06**: Comment threading (nested replies)

### UI Enhancements

- **UX-08**: Skeleton loaders replacing spinners for card grids

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Gemini AI / @google/genai | No AI features in scope — stripped from scaffold |
| Express server in frontend | Backend is separate and ready |
| Infinite scroll | Premature complexity — use paginated feed |
| Real-time updates / WebSocket | Massive complexity — poll on revisit instead |
| WYSIWYG recipe editor | ContentEditable minefield — use structured form fields |
| OAuth / social login (Google, GitHub) | Email/password sufficient for v1 |
| Global state library (Redux, Zustand) | React Context + API calls suffice |
| Backend changes | Backend is ready, no modifications needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 — Foundation & Authentication | Complete |
| AUTH-02 | Phase 1 — Foundation & Authentication | Complete |
| AUTH-03 | Phase 1 — Foundation & Authentication | Complete |
| AUTH-04 | Phase 1 — Foundation & Authentication | Complete |
| BROWSE-01 | Phase 2 — Browse & Discover | Pending |
| BROWSE-02 | Phase 2 — Browse & Discover | Pending |
| BROWSE-03 | Phase 2 — Browse & Discover | Pending |
| BROWSE-04 | Phase 2 — Browse & Discover | Pending |
| RECIPE-01 | Phase 3 — Recipe Management | Pending |
| RECIPE-02 | Phase 3 — Recipe Management | Pending |
| RECIPE-03 | Phase 3 — Recipe Management | Pending |
| RECIPE-04 | Phase 3 — Recipe Management | Pending |
| RECIPE-05 | Phase 3 — Recipe Management | Pending |
| RECIPE-06 | Phase 3 — Recipe Management | Pending |
| SOCIAL-01 | Phase 2 — Browse & Discover | Pending |
| SOCIAL-02 | Phase 2 — Browse & Discover | Pending |
| SOCIAL-03 | Phase 2 — Browse & Discover | Pending |
| UX-01 | Phase 4 — Polish & UX | Pending |
| UX-02 | Phase 4 — Polish & UX | Complete |
| UX-03 | Phase 3 — Recipe Management | Pending |
| UX-04 | Phase 4 — Polish & UX | Complete |
| UX-05 | Phase 1 — Foundation & Authentication | Complete |
| UX-06 | Phase 2 — Browse & Discover | Pending |
| UX-07 | Phase 2 — Browse & Discover | Pending |
| SETUP-01 | Phase 1 — Foundation & Authentication | Complete |
| SETUP-02 | Phase 1 — Foundation & Authentication | Complete |
| SETUP-03 | Phase 1 — Foundation & Authentication | Complete |
| SETUP-04 | Phase 1 — Foundation & Authentication | Complete |

**Coverage:**

- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-04*
*Last updated: 2026-06-05 — Traceability updated after roadmap creation*
