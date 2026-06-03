import api from './axios';

// TODO: Implement comentarios API calls
export const getComentarios = (recetaId) => api.get(`/recetas/${recetaId}/comentarios`);
export const createComentario = (recetaId, data) => api.post(`/recetas/${recetaId}/comentarios`, data);
export const deleteComentario = (id) => api.delete(`/comentarios/${id}`);
