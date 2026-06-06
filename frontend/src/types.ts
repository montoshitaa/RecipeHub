/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  category: string; // Breakfast, Lunch, Dinner, Dessert, Snack, Other
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: number;
  servings: number;
  imageUrl?: string | null;
  tags?: string[];
  authorId: string;
  authorName?: string;
  createdAt: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface Comment {
  _id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1 to 5
  createdAt: string;
}
