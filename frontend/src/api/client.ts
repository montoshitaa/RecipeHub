/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Recipe, Comment, User } from '../types';

const BASE_URL = "https://api.yourdomain.xyz";

// Helper to determine if we are in fallback/demo mode
export function getApiMode(): 'real' | 'fallback' {
  const stored = localStorage.getItem("recipehub_api_mode");
  if (stored === 'real' || stored === 'fallback') {
    return stored;
  }
  return 'fallback'; // Default to fallback for seamless preview testing, toggleable
}

export function setApiMode(mode: 'real' | 'fallback') {
  localStorage.setItem("recipehub_api_mode", mode);
  window.dispatchEvent(new Event("recipehub_api_mode_change"));
}

// Local mock database keys
const RECIPES_KEY = "recipehub_local_recipes";
const COMMENTS_KEY = "recipehub_local_comments";
const CURRENT_USER_KEY = "recipehub_local_user";
const TOKEN_KEY = "token"; // as requested: JWT stored in localStorage as `token`

// Default mock data to seed on first load
const DEFAULT_MOCK_RECIPES: Recipe[] = [
  {
    _id: "rec_1",
    title: "Classic Fluffy Pancakes",
    description: "Super fluffy, diner-style pancakes that are simple to make and always a crowd pleaser. Perfect with golden maple syrup.",
    category: "Breakfast",
    difficulty: "Easy",
    time: 20,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    tags: ["pancakes", "sweet", "classic"],
    authorId: "user_chef",
    authorName: "Chef John",
    createdAt: "2026-05-15T08:00:00.000Z",
    ingredients: [
      { name: "Flour", amount: 2, unit: "cups" },
      { name: "Eggs", amount: 2, unit: "units" },
      { name: "Milk", amount: 1.5, unit: "cups" },
      { name: "Butter", amount: 50, unit: "g" },
      { name: "Baking Powder", amount: 2, unit: "tsp" },
      { name: "Sugar", amount: 2, unit: "tbsp" }
    ],
    steps: [
      "In a large bowl, whisk together the flour, baking powder, sugar, and a pinch of salt.",
      "In another bowl, whisk the eggs, milk, and melted butter together.",
      "Pour the wet ingredients into the dry ingredients and stir gently until just combined.",
      "Heat a non-stick skillet over medium heat and grease lightly with butter.",
      "Pour 1/4 cup of batter for each pancake. Cook until bubbles pop on the surface, flip, and cook until golden brown."
    ]
  },
  {
    _id: "rec_2",
    title: "Rustic Tomato & Avocado Salad",
    description: "A vibrant, refreshing salad loaded with ripe heirloom tomatoes, sliced avocado, fresh basil leaves, and finished with a rich balsamic glaze.",
    category: "Lunch",
    difficulty: "Easy",
    time: 15,
    servings: 2,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    tags: ["salad", "healthy", "vegan"],
    authorId: "user_nature",
    authorName: "Alice Green",
    createdAt: "2026-05-20T12:30:00.000Z",
    ingredients: [
      { name: "Heirloom Tomatoes", amount: 3, unit: "units" },
      { name: "Avocado", amount: 1, unit: "unit" },
      { name: "Fresh Basil Leaves", amount: 1, unit: "cup" },
      { name: "Olive Oil", amount: 2, unit: "tbsp" },
      { name: "Balsamic Glaze", amount: 1, unit: "tbsp" }
    ],
    steps: [
      "Slice the tomatoes into bite-sized wedges and transfer to a serving plate.",
      "Cut the avocado in half, remove the pit, and slice thinly. Arrange on the plate with tomatoes.",
      "Scatter fresh basil leaves over the top.",
      "Drizzle with high-quality olive oil and thick balsamic glaze. Sprinkle with flaky sea salt and cracked pepper."
    ]
  },
  {
    _id: "rec_3",
    title: "Editorial Triple Chocolate Cake",
    description: "A decadent, dark triple chocolate layer cake suited for grand occasions, frosted with professional-grade shiny chocolate ganache.",
    category: "Dessert",
    difficulty: "Hard",
    time: 60,
    servings: 8,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    tags: ["chocolate", "cake", "baking"],
    authorId: "user_chef",
    authorName: "Chef John",
    createdAt: "2026-05-25T14:15:00.000Z",
    ingredients: [
      { name: "Flour", amount: 1.75, unit: "cups" },
      { name: "Cocoa Powder", amount: 0.75, unit: "cups" },
      { name: "Sugar", amount: 2, unit: "cups" },
      { name: "Eggs", amount: 2, unit: "units" },
      { name: "Hot Coffee", amount: 1, unit: "cup" },
      { name: "Butter", amount: 150, unit: "g" }
    ],
    steps: [
      "Preheat baking oven to 350°F and grease two 9-inch round baking pans.",
      "Whisk flour, cocoa powder, sugar, baking powder, and pinch of salt together.",
      "Whisk in eggs, milk, and melted butter. Stir in the hot coffee (the batter will be thin!).",
      "Bake for 30-35 minutes. Let cool completely.",
      "Frost with shiny warm chocolate ganache and decorate with dark chocolate shavings."
    ]
  }
];

const DEFAULT_MOCK_COMMENTS: Comment[] = [
  {
    _id: "com_1",
    recipeId: "rec_1",
    userId: "user_foodie",
    userName: "Mateo Rossi",
    content: "These are the fluffiest pancakes I've ever made! Incredible recipe. Simple and direct.",
    rating: 5,
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    _id: "com_2",
    recipeId: "rec_1",
    userId: "user_nature",
    userName: "Alice Green",
    content: "Turned out well but needs slightly more sugar in the batter for my taste. Still excellent!",
    rating: 4,
    createdAt: "2025-06-01T11:00:00.000Z"
  },
  {
    _id: "com_3",
    recipeId: "rec_2",
    userId: "user_chef",
    userName: "Chef John",
    content: "Simple, elegant, and clean. This is the definition of minimal design and incredible flavor.",
    rating: 5,
    createdAt: "2026-06-02T15:00:00.000Z"
  }
];

// Seed databases if empty
function initializeLocalStorageDb() {
  if (!localStorage.getItem(RECIPES_KEY)) {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(DEFAULT_MOCK_RECIPES));
  }
  if (!localStorage.getItem(COMMENTS_KEY)) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(DEFAULT_MOCK_COMMENTS));
  }
}

initializeLocalStorageDb();

// Generic API caller
export async function apiFetch(path: string, options: any = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Attempt real remote fetch if mode is explicitly set to 'real'
  if (getApiMode() === 'real') {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      const data = await res.json();
      if (!res.ok) {
        throw { status: res.status, ...data };
      }
      return data;
    } catch (err: any) {
      // In case of connection failure, fail back gracefully or throw if real is strictly required
      console.warn("Real API is unreachable. Falling back into mock mode.", err);
      // Let's toggle mode automatically to show a warning banner in UI
      setApiMode('fallback');
      // Rethrow to let the UI know, or execute mock instead. To be absolutely robust, we do mock below.
    }
  }

  // Fallback / Sandbox local simulated backend database
  return simulateLocalApi(path, options);
}

// Local simulation of all API endpoints
function simulateLocalApi(path: string, options: any = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Get current session user
  const storedUserJson = localStorage.getItem(CURRENT_USER_KEY);
  const sessionUser: User | null = storedUserJson ? JSON.parse(storedUserJson) : null;

  // Paths routing
  // 1. Auth routes
  if (path === "/api/auth/login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) {
      throw { status: 400, message: "Email and password are required." };
    }
    // Simple mock authenticate
    // Find or create user
    const formattedName = email.split('@')[0];
    const user: User = {
      _id: "user_" + formattedName,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      email: email,
      bio: "An enthusiastic recipe enthusiast and expert cooking curator.",
      avatarUrl: undefined,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(TOKEN_KEY, "mock_token_" + Date.now());
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { token: "mock_token_" + Date.now(), user };
  }

  if (path === "/api/auth/register" && method === "POST") {
    const { name, email, password, bio } = body;
    if (!name || !email || !password) {
      throw { status: 400, message: "Full name, email and password are required." };
    }
    if (password.length < 8) {
      throw { status: 400, message: "Password must be at least 8 characters long." };
    }

    const user: User = {
      _id: "user_" + Date.now(),
      name,
      email,
      bio: bio || "New home cook.",
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(TOKEN_KEY, "mock_token_" + Date.now());
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { token: "mock_token_" + Date.now(), user };
  }

  if (path === "/api/auth/me" && method === "GET") {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized token or session expired." };
    }
    return sessionUser;
  }

  // 2. Recipes routes
  // GET /api/recipes
  if (path.startsWith("/api/recipes") && method === "GET" && !path.includes("/comments")) {
    const recipes: Recipe[] = JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");
    
    // Check if single recipe request: /api/recipes/:id
    const parts = path.split("/");
    if (parts.length === 4) {
      const id = parts[3];
      const found = recipes.find(r => r._id === id);
      if (!found) {
        throw { status: 404, message: "Recipe not found." };
      }
      return found;
    }

    // List recipes with query params parsed manually
    let filtered = [...recipes];
    
    // Simple parameter filters
    const url = new URL(path, "http://localhost");
    const category = url.searchParams.get("category");
    const difficulty = url.searchParams.get("difficulty");

    if (category && category !== "All") {
      filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Sort by newest by default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }

  // POST /api/recipes
  if (path === "/api/recipes" && method === "POST") {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized. Please login." };
    }
    const recipes: Recipe[] = JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");
    const newRecipe: Recipe = {
      ...body,
      _id: "rec_" + Date.now(),
      authorId: sessionUser._id,
      authorName: sessionUser.name,
      createdAt: new Date().toISOString()
    };
    recipes.push(newRecipe);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    return newRecipe;
  }

  // PUT /api/recipes/:id
  if (path.startsWith("/api/recipes/") && method === "PUT") {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized. Please login." };
    }
    const parts = path.split("/");
    const id = parts[3];
    const recipes: Recipe[] = JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");
    const idx = recipes.findIndex(r => r._id === id);
    if (idx === -1) {
      throw { status: 404, message: "Recipe not found." };
    }
    if (recipes[idx].authorId !== sessionUser._id) {
      throw { status: 403, message: "Forbidden. You do not own this recipe." };
    }

    const updatedRecipe = {
      ...recipes[idx],
      ...body,
      authorId: sessionUser._id, // Guarantee retention of true author
      authorName: sessionUser.name
    };
    recipes[idx] = updatedRecipe;
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    return updatedRecipe;
  }

  // DELETE /api/recipes/:id
  if (path.startsWith("/api/recipes/") && method === "DELETE" && !path.includes("/comments")) {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized. Please login." };
    }
    const parts = path.split("/");
    const id = parts[3];
    const recipes: Recipe[] = JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");
    const idx = recipes.findIndex(r => r._id === id);
    if (idx === -1) {
      throw { status: 404, message: "Recipe not found." };
    }
    if (recipes[idx].authorId !== sessionUser._id) {
      throw { status: 403, message: "Forbidden. You do not own this recipe." };
    }

    const remaining = recipes.filter(r => r._id !== id);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(remaining));
    return { success: true, message: "Recipe successfully deleted." };
  }

  // 3. Comments routes
  // GET /api/recipes/:id/comments
  if (path.startsWith("/api/recipes/") && path.endsWith("/comments") && method === "GET") {
    const parts = path.split("/");
    const recipeId = parts[3];
    const comments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "[]");
    const matching = comments.filter(c => c.recipeId === recipeId);
    
    // Sort by newest comment first
    matching.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matching;
  }

  // POST /api/recipes/:id/comments
  if (path.startsWith("/api/recipes/") && path.endsWith("/comments") && method === "POST") {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized. Please login to leave comments." };
    }
    const parts = path.split("/");
    const recipeId = parts[3];
    const comments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "[]");
    
    const newComment: Comment = {
      _id: "com_" + Date.now(),
      recipeId,
      userId: sessionUser._id,
      userName: sessionUser.name,
      content: body.content,
      rating: body.rating,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    return newComment;
  }

  // DELETE /api/comments/:id
  if (path.startsWith("/api/comments/") && method === "DELETE") {
    if (!token || !sessionUser) {
      throw { status: 401, message: "Unauthorized. Please login." };
    }
    const parts = path.split("/");
    const commentId = parts[3];
    const comments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "[]");
    const foundIdx = comments.findIndex(c => c._id === commentId);
    if (foundIdx === -1) {
      throw { status: 404, message: "Comment not found." };
    }
    if (comments[foundIdx].userId !== sessionUser._id) {
      throw { status: 403, message: "Forbidden. You do not own this comment." };
    }

    const remaining = comments.filter(c => c._id !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(remaining));
    return { success: true, message: "Comment deleted successfully." };
  }

  throw { status: 404, message: `Endpoint simulated failed: ${method} ${path}` };
}
