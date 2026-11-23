import axios from './axiosInstance';

export const companyService = {
  getCompanies: async () => {
    try {
      const response = await axios.get('/companies');
      return response.data.data || response.data.companies || response.data;
    } catch (error) {
      console.warn('⚠️ Fallback getCompanies (Mode hors-ligne)', error.message);
      return [];
    }
  },
  
  getCompanyDetails: async (id) => {
    try {
      const response = await axios.get(`/companies/${id}`);
      const result = response.data.data || response.data;
      
      // Si le backend renvoie la structure { company, staff, projects }
      if (result && result.company) {
        return {
          ...result.company,
          staff: result.staff || [],
          projects: result.projects || []
        };
      }
      
      return result;
    } catch (error) {
      console.warn(`⚠️ Erreur getCompanyDetails pour l'ID ${id} :`, error.message);
      throw error;
    }
  },

  createCompany: async (formData) => {
    try {
      // TRÈS IMPORTANT en React Native : Ne pas définir manuellement le 'Content-Type' 
      // pour un FormData, sinon Axios/RN ne génère pas le boundary multipart.
      const response = await axios.post('/companies', formData);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('⚠️ Erreur createCompany :', error.message);
      throw error;
    }
  },

  getCompanyStaff: async (id) => {
    try {
      const response = await axios.get(`/companies/${id}/staff`);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('⚠️ Fallback getCompanyStaff (Mode hors-ligne)', error.message);
      return [];
    }
  },

  addCompanyStaff: async (id, staffData) => {
    try {
      const response = await axios.post(`/companies/${id}/staff`, staffData);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('⚠️ Erreur addCompanyStaff :', error.message);
      throw error;
    }
  },

  removeCompanyStaff: async (id, staffId) => {
    try {
      const response = await axios.delete(`/companies/${id}/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Erreur removeCompanyStaff :', error.message);
      throw error;
    }
  },

  getAuditLogs: async (id) => {
    try {
      const response = await axios.get(`/companies/${id}/audit`);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('⚠️ Fallback getAuditLogs (Mode hors-ligne)', error.message);
      return [];
    }
  }
};