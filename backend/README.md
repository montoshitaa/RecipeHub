# RecipeHub

Plataforma colaborativa de recetas de cocina. Stack: Node.js + Express + MongoDB (backend), React + Vite (frontend), Docker Compose, Nginx, GitHub Actions CI/CD.

---

## Architecture

```
Internet (HTTPS 443)
        │
        ▼
     Nginx (VPS)
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
api.recipehub.lat    app.recipehub.lat
proxy → :4000        serve static dist/
    │
    ▼
Docker Network (recipehub_net)
┌───────────┐     ┌───────────┐
│  api:4000 │────▶│  mongo:27017│
│ (Express) │     │ (MongoDB 7)│
└───────────┘     └─────┬─────┘
                        │
                   mongo_data (volume)
```

- **Nginx** terminates SSL, routes by subdomain, serves the React build as static files.
- **api** container runs Express on port 4000 (exposed to host, not to the internet directly).
- **mongo** container is on the internal Docker network only — no port exposed to the host.
- **mongo_data** is a named Docker volume that persists data across container restarts.

---

## Environment Variables

### Root `.env` (read by Docker Compose)

| Variable | Description |
|---|---|
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username created on first run |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password created on first run |
| `PORT` | Port the Express API listens on inside the container |
| `MONGO_URI` | Full MongoDB connection string used by the API. Must use the Docker service name `mongo` as the host |
| `JWT_SECRET` | Long random string used to sign and verify JWT tokens. Must be the same across all environments |

Example:

```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=YourStrongPassword123
PORT=4000
MONGO_URI=mongodb://admin:YourStrongPassword123@mongo:27017/recipehub?authSource=admin
JWT_SECRET=a_very_long_random_secret_string
```

### Frontend `.env` (optional, read by Vite at build time)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. If not set, defaults to `https://api.recipehub.lat` |

---

## Local Docker Setup

```bash
cp .env.example .env
# Edit .env with your values
docker compose up -d --build
```

API available at `http://localhost:4000/api`.

---

## Authentication

Uses a dual-token JWT scheme with server-side refresh token tracking:

| Token | Lifetime | Storage |
|---|---|---|
| **Access token** | 15 minutes | Response body (`accessToken`), sent as `Authorization: Bearer` header |
| **Refresh token** | 7 days | HttpOnly, Secure, SameSite=Strict cookie (`refreshToken`), path `/api/auth` |
| **CSRF token** | 7 days | Non-HttpOnly cookie (`csrfToken`), verified via `X-CSRF-Token` header |

### Flow

1. **Login/Register** → Backend generates all three tokens, sets cookies, returns `accessToken` and user in the response body. The refresh token is stored server-side in the user's `refreshTokens` array.
2. **API requests** → Frontend sends access token as `Authorization: Bearer <accessToken>` and CSRF token as `X-CSRF-Token` header.
3. **Token refresh** → When the access token expires (401), the frontend calls `POST /api/auth/refresh`. The HttpOnly refresh cookie is sent automatically. The backend validates the token against the stored list, rotates it (old removed, new one stored), and returns a fresh access token.
4. **Reuse detection** → If a refresh token is presented after being rotated (stolen token scenario), it's rejected and the client's cookies are cleared. Other valid sessions on the same account are unaffected.
5. **Logout** → Server clears the user's stored refresh tokens and expires the cookies server-side.

Protected endpoints require:

```
Authorization: Bearer <token>
```

`POST /api/auth/register`

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret123"
}
```

`POST /api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "secret123"
}
```

Both return:

```json
{
  "user": { "id": "...", "name": "Test User", "email": "test@example.com" },
  "accessToken": "..."
}
```

`POST /api/auth/refresh`

No body required. Sends `refreshToken` HttpOnly cookie automatically. Returns:

```json
{
  "accessToken": "..."
}
```

`POST /api/auth/logout`

Clears the user's stored refresh tokens and expires cookies. Requires `Authorization: Bearer` header.

---

## Endpoints

```
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/auth/me

GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id

GET    /api/recipes/:id/comments
POST   /api/recipes/:id/comments
DELETE /api/comments/:id
```

`GET /api/recipes` accepts optional query params: `category`, `difficulty`, `tags`, `search`.

### Recipe Payload

```json
{
  "title": "Chicken Soup",
  "description": "Simple homemade soup",
  "category": "Dinner",
  "cookTimeMin": 35,
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [{ "name": "Chicken", "amount": 1, "unit": "kg" }],
  "steps": ["Boil water", "Add chicken", "Simmer"],
  "tags": ["soup", "chicken"],
  "imageUrl": "https://example.com/img.jpg"
}
```

Allowed `difficulty` values: `Easy`, `Medium`, `Hard`.

### Comment Payload

```json
{ "content": "Great recipe", "rating": 5 }
```

`rating` must be an integer from 1 to 5.

---

## Tests

```bash
cd backend && npm test
```

Or via Docker:

```bash
docker compose exec api npm test
```

---

## Server Infrastructure (VPS)

Production runs on Ubuntu 24.04 LTS at `178.156.232.97`.

### 1. Install Required Software

```bash
# Docker Engine
apt update
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx git
```

### 2. Firewall

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. DNS Records

Create two A records in your domain registrar pointing to the VPS IP:

| Subdomain | Type | Value |
|---|---|---|
| `api.recipehub.lat` | A | `178.156.232.97` |
| `app.recipehub.lat` | A | `178.156.232.97` |

Wait for DNS propagation (up to 48 hours) before proceeding with SSL.

### 4. First Deploy (manual)

```bash
# Clone the repository
git clone https://github.com/montoshitaa/RecipeHub.git /opt/recipehub
cd /opt/recipehub

# Create production .env
cp .env.example .env
nano .env   # fill in real values

# Build frontend and copy to dist
cd frontend && npm install && npm run build
cd ..

# Start containers
docker compose up -d --build
```

### 5. SSL Certificate

```bash
certbot --nginx -d api.recipehub.lat -d app.recipehub.lat
```

Certbot auto-configures Nginx and sets up a systemd timer for auto-renewal.

### 6. Nginx Configuration

Located at `/etc/nginx/sites-enabled/default`:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.recipehub.lat app.recipehub.lat recipehub.lat www.recipehub.lat;
    return 301 https://$host$request_uri;
}

# API
server {
    listen 443 ssl;
    server_name api.recipehub.lat;
    ssl_certificate /etc/letsencrypt/live/api.recipehub.lat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.recipehub.lat/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Frontend
server {
    listen 443 ssl;
    server_name app.recipehub.lat;
    ssl_certificate /etc/letsencrypt/live/api.recipehub.lat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.recipehub.lat/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /opt/recipehub/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

Reload after any change:

```bash
nginx -t && systemctl reload nginx
```

### Deployment Directory Structure

```
/opt/recipehub/
├── .env                  ← production secrets (never committed)
├── docker-compose.yml
├── backend/
└── frontend/
    └── dist/             ← compiled React build served by Nginx
```

---

## CI/CD — GitHub Actions

The workflow at `.github/workflows/deploy.yml` runs automatically on every push to `main`.

**Job 1 — build-and-test:**
1. Checks out the code
2. Installs Node.js dependencies
3. Runs `npm test` — must pass at least 3 unit tests

**Job 2 — deploy** (runs only if tests pass):
1. Connects to the VPS via SSH using the `VPS_SSH_KEY` secret
2. Pulls the latest code with `git pull`
3. Writes the production `.env` from GitHub Secrets
4. Runs `docker compose up -d --build` to rebuild and restart containers
5. Runs `curl https://api.recipehub.lat/api/health` — must return `{"status":"ok"}` to confirm the deploy succeeded

### GitHub Secrets Required

Configure these under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `VPS_HOST` | Public IP of the VPS |
| `VPS_USER` | SSH user (e.g. `root`) |
| `VPS_SSH_KEY` | Full private SSH key in PEM format (including `BEGIN`/`END` lines) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password |

---

## Health Check

```bash
curl https://api.recipehub.lat/api/health
# → {"status":"ok","timestamp":"..."}
```
