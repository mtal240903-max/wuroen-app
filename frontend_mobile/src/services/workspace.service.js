import api from './api';

export const workspaceService = {
  // Récupérer les entreprises / pages de l'utilisateur
  getMyWorkspaces: async () => {
    const response = await api.get('/companies');
    return response.data;
  },
  
  // Récupérer les invitations en attente (routes backend /team/invitations/pending)
  getPendingInvitations: async () => {
    const response = await api.get('/team/invitations/pending');
    return response.data;
  },

  // Créer une nouvelle entreprise/page
  createWorkspace: async (name, plan) => {
    const response = await api.post('/companies', { name, plan });
    return response.data;
  },

  // Répondre à une invitation d'entreprise/page (PUT /api/team/:workspaceId/invitations/respond)
  respondToInvitation: async (workspaceId, accept) => {
    const response = await api.put(`/team/${workspaceId}/invitations/respond`, { accept });
    return response.data;
  },

  // Inviter un membre à rejoindre spécifiquement une entreprise/page
  inviteMember: async (companyId, email) => {
    const response = await api.post(`/team/${companyId}/invite`, { email });
    return response.data;
  },
};