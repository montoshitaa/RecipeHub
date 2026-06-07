# RecipeHub

Collaborative recipe platform.

## Stack

- **Backend:** Node.js + Express (port 4000)
- **Frontend:** React 18 + Vite (port 5173)
- **Database:** MongoDB 7 (Mongoose)
- **Infrastructure:** Docker Compose + Nginx + GitHub Actions

## Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Git

## Getting Started

### 1. Environment setup

```bash
cp .env.example .env
```

Open `.env` and adjust values if needed (the examples work for local development).

### 2. Backend + Database (Docker Compose)

```bash
# Build images and start services in the background
docker compose up -d

# Check that both containers are running
docker compose ps
```

This starts:

| Service | Port | Access |
|---|---|---|
| **mongo** | — | Internal network only |
| **api** | `4000` | `http://localhost:4000` |

The backend source is mounted as a volume, so any changes in `backend/src/` auto-restart the server (nodemon).

### 3. Frontend (local Vite dev server)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite starts at `http://localhost:5173`. Requests to `/api/*` are proxied to the backend at `localhost:4000` (configured in `vite.config.js`).

### 4. Verify everything works

```bash
# Health check
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}

# Backend logs
docker compose logs api

# Expected output:
# Server running on port 4000
# MongoDB connected: ...
```

Open `http://localhost:5173` in your browser — you should see the welcome message.

### Quick reference

```
Terminal 1 → docker compose up -d     (MongoDB + API on :4000)
Terminal 2 → cd frontend && npm run dev  (React on :5173)
Browser    → http://localhost:5173
```

## Useful commands

```bash
# Tail all logs
docker compose logs -f

# Logs for a specific service
docker compose logs api -f
docker compose logs mongo -f

# Rebuild the API image (needed after package.json changes)
docker compose build api

# Stop services (keeps data)
docker compose down

# Stop services and delete volumes (loses MongoDB data)
docker compose down -v

# Run backend tests
docker compose exec api npm test
```

## Project structure

```
recipehub/
├── backend/               # Express API
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middlewares/    # Auth, validation
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Route definitions
│   │   ├── app.js         # Express setup
│   │   └── server.js      # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React SPA (Vite)
│   └── src/
├── nginx/                 # Reverse proxy (production)
├── .github/workflows/     # CI/CD
└── docker-compose.yml
```
 
