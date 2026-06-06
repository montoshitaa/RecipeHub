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
  return api.get(path).then((res) => {
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data?.recipes && Array.isArray(data.recipes)) return data.recipes;
    return [];
  });
};

export const getRecipe = (id: string): Promise<Recipe> =>
  api.get(`/api/recipes/${id}`).then((res) => {
    const data = res.data;
    if (data?.recipe) return data.recipe;
    return data;
  });

export const getComments = (recipeId: string): Promise<Comment[]> =>
  api.get(`/api/recipes/${recipeId}/comments`).then((res) => {
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data?.comments && Array.isArray(data.comments)) return data.comments;
    return [];
  });

export const postComment = (
  recipeId: string,
  data: { content: string; rating: number }
): Promise<Comment> =>
  api.post(`/api/recipes/${recipeId}/comments`, data).then((res) => res.data);

export const createRecipe = async (
  data: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>
): Promise<Recipe> => {
  const { time, ...rest } = data;
  const res = await api.post('/api/recipes', { ...rest, cookTimeMin: time });
  const recipe = res.data.recipe as Recipe & { cookTimeMin: number };
  return { ...recipe, time: recipe.cookTimeMin };
};

export const updateRecipe = async (
  id: string,
  data: Partial<Omit<Recipe, '_id' | 'authorId' | 'createdAt'>>
): Promise<Recipe> => {
  const { time, ...rest } = data;
  const payload = { ...rest, ...(time !== undefined ? { cookTimeMin: time } : {}) };
  const res = await api.put(`/api/recipes/${id}`, payload);
  const recipe = res.data.recipe as Recipe & { cookTimeMin: number };
  return { ...recipe, time: recipe.cookTimeMin };
};

export const deleteRecipe = (id: string): Promise<void> =>
  api.delete(`/api/recipes/${id}`).then(() => undefined);

export const deleteComment = (commentId: string): Promise<void> =>
  api.delete(`/api/comments/${commentId}`).then(() => undefined);
