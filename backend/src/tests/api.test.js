process.env.JWT_SECRET = 'test-secret';

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

jest.setTimeout(120000);

const buildRecipePayload = () => ({
  title: 'Test Chicken Soup',
  description: 'A simple recipe created during automated tests.',
  category: 'Dinner',
  cookTimeMin: 35,
  servings: 4,
  difficulty: 'Easy',
  ingredients: [{ name: 'Chicken', amount: 1, unit: 'kg' }],
  steps: ['Boil water', 'Add chicken', 'Simmer'],
  tags: ['test', 'soup'],
});

const buildTestMongoUri = (mongoUri) => {
  const testUri = mongoUri.replace(/\/([^/?]+)(\?|$)/, '/recipehub_test$2');

  if (testUri === mongoUri) {
    throw new Error('Unable to build test MongoDB URI');
  }

  return testUri;
};

const registerUser = async (email = 'test-user@example.com') => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password: 'secret123',
    })
    .expect(201);

  return response.body;
};

const createRecipe = async (token) => {
  const response = await request(app)
    .post('/api/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(buildRecipePayload())
    .expect(201);

  return response.body.recipe;
};

describe('RecipeHub API', () => {
  let mongoServer;

  beforeAll(async () => {
    if (process.env.MONGO_URI) {
      await mongoose.connect(buildTestMongoUri(process.env.MONGO_URI));
      return;
    }

    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 60000 },
    });
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('GET /api/health returns service status', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  test('POST /api/auth/register creates a user and returns a JWT', async () => {
    const response = await registerUser();

    expect(response.user.email).toBe('test-user@example.com');
    expect(response.user.password).toBeUndefined();
    expect(response.token).toBeDefined();
  });

  test('GET /api/auth/me rejects requests without a token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);

    expect(response.body.message).toBe('Authentication token is required');
  });

  test('POST /api/recipes creates a recipe for an authenticated user', async () => {
    const { token } = await registerUser();
    const recipe = await createRecipe(token);

    expect(recipe.title).toBe('Test Chicken Soup');
    expect(recipe.authorId.email).toBe('test-user@example.com');
  });

  test('POST /api/recipes/:id/comments creates a comment for an authenticated user', async () => {
    const { token } = await registerUser();
    const recipe = await createRecipe(token);

    const response = await request(app)
      .post(`/api/recipes/${recipe._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Great recipe', rating: 5 })
      .expect(201);

    expect(response.body.comment.content).toBe('Great recipe');
    expect(response.body.comment.rating).toBe(5);
    expect(response.body.comment.recipeId).toBe(recipe._id);
  });
});
