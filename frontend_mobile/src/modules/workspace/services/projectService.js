import api from '../../../services/api';

export const projectService = {
  // Lister tous les projets de l'utilisateur (personnels et de ses entreprises)
  getUserProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Lister les projets spécifiques à une entreprise donnée
  getCompanyProjects: async (companyId) => {
    const response = await api.get(`/projects/company/${companyId}`);
    return response.data;
  },

  // Créer un projet (soit personnel, soit lié à une entreprise via companyId dans le body)
  createProject: async (projectData) => {
    // projectData peut contenir { name, description, companyId (optionnel) }
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Inviter un membre de manière temporaire sur un projet (qu'il soit personnel ou d'entreprise)
  inviteToProject: async (projectId, email, role = 'collaborateur', durationDays = null) => {
    const response = await api.post(`/projects/${projectId}/invite`, { 
      email, 
      role, 
      durationDays 
    });
    return response.data;
  },

  createFolder: async (projectId, folderData) => {
    const response = await api.post(`/projects/${projectId}/folders`, folderData);
    return response.data;
  },

  getFolderContent: async (projectId, parentFolderId = '') => {
    const url = parentFolderId 
      ? `/projects/${projectId}/folders?parentFolder=${parentFolderId}`
      : `/projects/${projectId}/folders`;
    const response = await api.get(url);
    return response.data;
  },

  createFile: async (projectId, fileData) => {
    const response = await api.post(`/projects/${projectId}/files`, fileData);
    return response.data;
  }
};