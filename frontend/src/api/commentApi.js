import api from './axios';

export const getComments = (recipeId) => api.get(`/recipes/${recipeId}/comments`);
export const createComment = (recipeId, data) => api.post(`/recipes/${recipeId}/comments`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
