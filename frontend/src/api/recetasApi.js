import api from './axios';

// TODO: Implement recetas API calls
export const getRecetas = (params) => api.get('/recetas', { params });
export const getRecetaById = (id) => api.get(`/recetas/${id}`);
export const createReceta = (data) => api.post('/recetas', data);
export const updateReceta = (id, data) => api.put(`/recetas/${id}`, data);
export const deleteReceta = (id) => api.delete(`/recetas/${id}`);
