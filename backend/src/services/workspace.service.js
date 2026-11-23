import api from './api';

export const workspaceService = {
  getMyWorkspaces: async () => {
    // ⚠️ Assurez-vous d'utiliser "api" (minuscule) et non "API" (majuscule)
    const response = await api.get('/companies');
    return response.data;
  },
  
  getPendingInvitations: async () => {
    const response = await api.get('/companies/invitations');
    return response.data;
  },

  createWorkspace: async (name, plan) => {
    const response = await api.post('/companies', { name, plan });
    return response.data;
  },

  respondToInvitation: async (workspaceId, action) => {
    const response = await api.post(`/companies/${workspaceId}/invitation`, { action });
    return response.data;
  },
};