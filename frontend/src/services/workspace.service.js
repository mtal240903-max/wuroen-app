import API from './api';

export const workspaceService = {
  // Récupérer les espaces acceptés
  getMyWorkspaces: async () => {
    const response = await API.get('/workspaces/my-spaces');
    return response.data;
  },

  // Créer un espace de travail
  createWorkspace: async (name, plan = 'free') => {
    const response = await API.post('/workspaces', { name, plan });
    return response.data;
  },

  // Envoyer une invitation
  inviteMember: async (workspaceId, email, role) => {
    const response = await API.post(`/workspaces/${workspaceId}/invite`, { email, role });
    return response.data;
  },

  // Récupérer les invitations en attente
  getPendingInvitations: async () => {
    const response = await API.get('/workspaces/invitations/pending');
    return response.data;
  },

  // Accepter ou refuser une invitation ('Accept' ou 'Decline')
  respondToInvitation: async (workspaceId, action) => {
    const response = await API.put(`/workspaces/${workspaceId}/invitations/respond`, { action });
    return response.data;
  }
};