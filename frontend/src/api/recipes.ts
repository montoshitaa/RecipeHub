import { api } from './client';
import type { Recipe } from '../types';

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
