# RecipeHub Backend

Express API for RecipeHub.

## Local Docker Setup

From the repository root:

```bash
cp .env.example .env
docker compose up -d --build mongo api
```

The API runs at:

```txt
http://localhost:4000/api
```

MongoDB runs inside the Docker network. The API connects to it using the `mongo` service name.

## Environment Variables

Required by Docker Compose and the API:

```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=secure_password_123
PORT=4000
MONGO_URI=mongodb://admin:secure_password_123@mongo:27017/recipehub?authSource=admin
JWT_SECRET=your_super_secret_key_change_in_production
```

Use a long private `JWT_SECRET` in production. Do not commit real secrets.

## Authentication

Protected endpoints require:

```txt
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
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "..."
}
```

## Endpoints

```txt
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id

GET    /api/recipes/:id/comments
POST   /api/recipes/:id/comments
DELETE /api/comments/:id
```

## Recipe Payload

```json
{
  "title": "Chicken Soup",
  "description": "Simple homemade soup",
  "category": "Dinner",
  "cookTimeMin": 35,
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    { "name": "Chicken", "amount": 1, "unit": "kg" }
  ],
  "steps": ["Boil water", "Add chicken", "Simmer"],
  "tags": ["soup", "chicken"],
  "imageUrl": "https://example.com/chicken-soup.jpg"
}
```

Allowed `difficulty` values:

```txt
Easy, Medium, Hard
```

`GET /api/recipes` supports optional query params:

```txt
category
difficulty
tags
search
```

Example:

```txt
/api/recipes?category=Dinner&difficulty=Easy&tags=soup&search=chicken
```

## Comment Payload

```json
{
  "content": "Great recipe",
  "rating": 5
}
```

`rating` must be an integer from 1 to 5.

## Tests

From `backend/`:

```bash
npm test
```

From the repository root using Docker:

```bash
docker compose exec api npm test
```

Tests use a separate database named `recipehub_test` when `MONGO_URI` is present, and drop it after running.
