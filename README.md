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

## Environment Setup

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd RecipeHub

# 2. Crear archivo de variables de entorno
cp .env.example .env
```

Abre `.env` y ajusta los valores si es necesario (los de ejemplo funcionan para desarrollo local).

## Cómo levantar todo (desarrollo)

### 1. Backend + Base de Datos (Docker Compose)

```bash
# Construye imágenes e inicia los servicios en segundo plano
docker compose up -d

# Verifica que ambos contenedores estén corriendo
docker compose ps
```

Esto levanta:

| Servicio | Puerto | Acceso |
|---|---|---|
| **mongo** | — | Red interna solo |
| **api** | `4000` | `http://localhost:4000` |

El backend se monta como volumen, por lo que cualquier cambio en `backend/src/` reinicia el servidor automáticamente (nodemon).

### 2. Frontend (local con Vite)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Esto inicia Vite en `http://localhost:5173`. Las peticiones a `/api/*` se redirigen automáticamente al backend en `localhost:4000` gracias al proxy configurado en `vite.config.js`.

### 3. Verificar que todo funciona

```bash
# Health check de la API
curl http://localhost:4000/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"..."}

# Logs del backend
docker compose logs api

# Deberías ver:
# Server running on port 4000
# MongoDB connected: ...
```

Abre `http://localhost:5173` en el navegador para ver la app.

### Resumen visual

```
Terminal 1 → docker compose up -d    (MongoDB + API en :4000)
Terminal 2 → cd frontend && npm run dev  (React en :5173)
Navegador  → http://localhost:5173
```

## Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs api -f
docker compose logs mongo -f

# Reconstruir la imagen del backend (tras cambiar package.json)
docker compose build api

# Detener servicios (sin borrar datos)
docker compose down

# Detener servicios y borrar volúmenes (pierdes datos de MongoDB)
docker compose down -v

# Ejecutar tests del backend
docker compose exec api npm test
```

## Modo producción (Docker Compose + Nginx)

> Pendiente — requiere configurar dominios y SSL.

El directorio `nginx/` contiene la configuración para servir el frontend compilado y redirigir peticiones API al backend.

## Estructura del proyecto

```
recipehub/
├── backend/               # Express API
│   ├── src/
│   │   ├── config/        # Conexión a MongoDB
│   │   ├── controllers/   # Lógica de rutas
│   │   ├── middlewares/    # Auth, validación
│   │   ├── models/        # Schemas de Mongoose
│   │   ├── routes/        # Definición de rutas
│   │   ├── app.js         # Configuración de Express
│   │   └── server.js      # Punto de entrada
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React SPA (Vite)
│   └── src/
├── nginx/                 # Reverse proxy (producción)
├── .github/workflows/     # CI/CD
└── docker-compose.yml
```
