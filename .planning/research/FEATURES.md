# Feature Landscape

**Domain:** Collaborative recipe platform frontend
**Researched:** 2026-06-04

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Recipe feed with cards | Users need to browse recipes; cards are the standard pattern for content feeds | Medium | shadcn/ui Card component. Grid layout with Tailwind responsive breakpoints. Each card: image, title, author, difficulty badge, cook time |
| Recipe filtering/search | Users expect to narrow results by category, difficulty, tags, and free-text search | Medium | Filter bar with category/difficulty selects and search input. Debounced search (300ms). URL query params for shareable filtered views |
| Recipe detail page | Users need to see full recipe: ingredients, steps, author, comments | Medium | Two-column layout (desktop): ingredients sidebar, steps main. Single column (mobile). Author info, difficulty badge, tags, cook time, servings |
| Create/edit recipe form | Users need to publish and update their recipes | High | Multi-field form with dynamic ingredient rows (name, amount, unit) and dynamic step list. RHF `useFieldArray`. Image upload with dropzone preview |
| Image upload with preview | Recipe images are expected; drag-and-drop is standard UX for 2026 | Medium | react-dropzone for drag zone + click-to-browse. Preview thumbnail before upload. Upload to `POST /api/upload`, store returned URL |
| Comments with ratings | Users expect to leave feedback (1-5 stars) on recipes they've tried | Medium | Comment list below recipe. Star rating input (interactive stars, not a select). Author-only delete. Flat list (no threading unless specified) |
| User profile page | Users expect a page showing their info and their published recipes | Low | Avatar, name, bio. Grid of user's recipes. Edit profile link |
| Authentication UI | Users need to sign up, log in, log out | Low | Existing routes exist but pages are stubs. Login/register forms, JWT token storage, protected route redirects |
| Responsive design | Users access on mobile, tablet, desktop; must look polished on all | Medium | Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Card grid: 1 col mobile, 2 col tablet, 3 col desktop |
| Loading states | Users need feedback that data is loading | Low | Skeleton loaders (shadcn Skeleton) for cards, detail page. Spinner for full-page loads |
| Error states | Users need clear feedback when things go wrong | Low | Error messages on forms (field-level validation errors from API). Toast notifications for async errors (sonner). 404 page for missing recipes |
| Empty states | Users need guidance when there's no data | Low | "No recipes found" with suggestion to adjust filters. "You haven't published any recipes yet" on profile. Friendly illustration or icon |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Difficulty badge with color coding | Quick visual scan of recipe complexity (Easy=green, Medium=yellow, Hard=red) | Low | shadcn/ui Badge with variant mapping. Trivial to implement, high visual impact |
| Ingredient checklist on detail page | Users can check off ingredients as they cook (interactive, not persisted) | Low | Checkbox next to each ingredient. Local state only (resets on page leave). Distinctive UX that other recipe sites lack |
| Recipe image as hero banner | Large hero image on detail page creates premium feel | Low | Full-width image at top of detail page with overlay gradient for title readability. Tailwind makes this trivial |
| Time and servings summary bar | Quick-glance info strip: ⏱ 45 min · 🍽 4 servings · 🔥 Medium | Low | Horizontal bar with lucide-react icons. Important info visible without scrolling |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Infinite scroll on recipe feed | Adds complexity (intersection observer, cursor-based pagination). Premature for small recipe counts | Paginated feed — simpler, URL-friendly, works with existing `GET /api/recipes` |
| Real-time updates (WebSocket) | Massive complexity. Recipe comments don't need live updates for v1 | Poll on page revisit. Refresh button on detail page |
| WYSIWYG recipe editor | ContentEditable is a minefield. Recipes are structured data (ingredients, steps), not freeform rich text | Structured form fields with text inputs and textareas. Markdown support for description if needed |
| Social features (following, likes, activity feeds) | Explicitly out of scope per PROJECT.md. Would require new backend endpoints and schema changes | Defer to v2 milestone |
| OAuth / social login | Explicitly out of scope. Adds third-party dependency and auth complexity | Email/password only — already built |
| Comment threading (nested replies) | Adds significant complexity (recursive rendering, indentation limits, collapse/expand). Unclear if needed | Flat comment list for v1. Clarify with stakeholders before adding threading |

## Feature Dependencies

```
Tailwind CSS v4 setup → shadcn/ui components → Card, Button, Input, Form components
                                                     ↓
                                    RecipeCard → Recipe Feed (HomePage)
                                          ↓
                                    Recipe Detail Page → Comment list, Comment form
                                          ↓
                                    Form components (RHF + shadcn Form) → Create/Edit Recipe forms
                                          ↓
                                    react-dropzone → Image upload with preview
                                          ↓
                                    Profile Page (uses RecipeCard grid)
```

## MVP Recommendation

Prioritize:
1. Tailwind CSS v4 + shadcn/ui foundation (layout shell, Navbar, design tokens)
2. Recipe feed (HomePage) with RecipeCard, filter bar, search
3. Recipe detail page with comments and star ratings
4. Create/edit recipe forms with dynamic fields + image upload
5. Profile page + responsive polish pass

Defer:
- Ingredient checklist: Nice-to-have, add after core pages work
- Comment threading: Clarify requirement first
- Skeleton loaders: Add after pages render correctly with spinners

## Sources

- PROJECT.md §Active — feature requirements for this milestone
- PROJECT.md §Out of Scope — features explicitly excluded
- shadcn/ui component catalog — Card, Form, Input, Textarea, Select, Badge, Avatar, Dialog, Tabs, Skeleton
- react-hook-form documentation — useFieldArray for dynamic fields
- react-dropzone documentation — file preview, drag-and-drop zone
