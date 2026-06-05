import { api } from './client';
import type { Recipe, Comment } from '../types';

export const getRecipes = (
  params?: { category?: string; difficulty?: string }
): Promise<Recipe[]> => {
  const searchParams = new URLSearchParams();
  if (params) {
    if (params.category && params.category !== 'All') {
      searchParams.append('category', params.category);
    }
    if (params.difficulty && params.difficulty !== 'All') {
      searchParams.append('difficulty', params.difficulty);
    }
  }
  const query = searchParams.toString();
  const path = query ? `/api/recipes?${query}` : '/api/recipes';
  return api.get(path).then((res) => res.data);
};

export const getRecipe = (id: string): Promise<Recipe> =>
  api.get(`/api/recipes/${id}`).then((res) => res.data);

export const getComments = (recipeId: string): Promise<Comment[]> =>
  api.get(`/api/recipes/${recipeId}/comments`).then((res) => res.data ?? []);

export const postComment = (
  recipeId: string,
  data: { content: string; rating: number }
): Promise<Comment> =>
  api.post(`/api/recipes/${recipeId}/comments`, data).then((res) => res.data);

export const deleteComment = (commentId: string): Promise<void> =>
  api.delete(`/api/comments/${commentId}`).then(() => undefined);
