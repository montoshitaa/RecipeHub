# RecipeHub

## What This Is

RecipeHub is a collaborative recipe platform — a React 19 + TypeScript frontend backed by an existing API. Users browse, filter, and search recipes; view full recipe details with ingredients and steps; create and edit their own recipes with image upload; and interact through comments and ratings. The frontend replaces the current placeholder with a polished UI built from an AI Studio-generated Tailwind v4 scaffold, enhanced with shadcn/ui components.

## Core Value

Users can discover, create, and share recipes through a polished, responsive web interface — if nothing else works, the recipe feed with cards and the recipe detail page must work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Recipe feed with card grid (image, title, author, difficulty badge, cook time)
- [ ] Recipe filtering and search (category, difficulty, tags, free-text, debounced, URL query params)
- [ ] Recipe detail page (hero image, ingredients, steps, author info, comments with star ratings)
- [ ] Create/edit recipe form (multi-field, dynamic ingredient rows, step list, image upload with drag-and-drop)
- [ ] Authentication UI (login/register forms, JWT token storage, protected route redirects)
- [ ] Responsive design (mobile/tablet/desktop via Tailwind breakpoints)
- [ ] Loading, error, and empty states across all pages

### Out of Scope

- Gemini AI / LLM features — scaffold included @google/genai; stripped for RecipeHub
- Express server in frontend — backend is separate and ready
- Comment threading (nested replies) — defer to v2
- Social features (following, likes, activity feeds) — explicitly out of scope
- Real-time updates / WebSocket — poll on revisit instead
- WYSIWYG recipe editor — structured form fields instead
- OAuth / social login — email/password only
- Global state library (Redux, Zustand) — React Context + API calls suffice

## Context

RecipeHub has an existing backend with API endpoints for recipes, auth, comments, and image upload. The current frontend directory is a placeholder/template. A new frontend scaffold exists in `frontend-to-implement/` (AI Studio-generated, React 19 + Tailwind v4 + TypeScript) that provides the UI layout, Tailwind setup, and component structure foundation.

The scaffold must be adapted to remove Express server bundling and Google Gemini integration, then rebuilt with RecipeHub-specific pages and components. Backend integration is straightforward — API endpoints are ready, the frontend connects to them via axios.

## Constraints

- **Tech stack**: React 19, TypeScript, Tailwind CSS v4 (via @tailwindcss/vite), Vite 6
- **Component library**: shadcn/ui (copy-paste, not npm — owns its own code)
- **Forms**: react-hook-form 7 + zod 3 for validation
- **Icons**: lucide-react
- **Toasts**: sonner
- **Image upload**: react-dropzone for drag-and-drop UI
- **Backend**: Existing API, no changes needed to backend
- **No**: Express in frontend, Gemini SDK, CSS-in-JS, Bootstrap, MUI, Redux

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use frontend-to-implement/ as UI scaffold | Provides Tailwind v4 setup, layout, and component structure ready to go | — Pending |
| React 19 + TypeScript over React 18 + JSX | Scaffold is already on 19 + TS; modern stack with no downgrade overhead | — Pending |
| Strip Gemini and Express from scaffold | Backend is separate; no AI features in scope | — Pending |
| shadcn/ui for components | Accessible, owns its code, built on Radix + Tailwind | — Pending |
| Incremental build over rewrite | Keep working patterns from scaffold, add features incrementally | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-04 after initialization*
