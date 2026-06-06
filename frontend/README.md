# RecipeHub Frontend

## Prerequisites
- Node.js 24+
- Backend running on port 4000

## Getting Started

1. Start the backend (from repo root):
   ```
   cd backend && npm install && npm run dev
   ```
   Backend runs on http://localhost:4000

2. Start the frontend (from repo root):
   ```
   cd frontend && npm install && npm run dev
   ```
   Frontend runs on http://localhost:3000

3. Open http://localhost:3000 in your browser.

## Available Scripts
- `npm run dev` — Start Vite dev server on port 3000
- `npm run build` — Production build to dist/
- `npm run preview` — Preview production build locally
- `npm run lint` — TypeScript type checking (tsc --noEmit)

## Architecture
The Vite dev server proxies `/api/*` requests to `http://localhost:4000`.
Authentication uses JWT Bearer tokens stored in localStorage.
