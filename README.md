# RecipeHub

Collaborative recipe platform.

## Stack

- **Backend:** Node.js + Express (port 4000)
- **Frontend:** React 18 + Vite
- **Database:** MongoDB 7 (Mongoose)
- **Infrastructure:** Docker Compose + Nginx + GitHub Actions

## Quick Start

```bash
cp .env.example .env
docker-compose up --build
```

## Structure

```
recipehub/
├── backend/          # Express API
├── frontend/         # React SPA
├── nginx/            # Reverse proxy config
├── .github/workflows/# CI/CD pipelines
└── docker-compose.yml
```
