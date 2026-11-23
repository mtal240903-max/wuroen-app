import axios from 'axios'; // Ou votre instance axios personnalisée (ex: import api from '../../../services/api')
import { BASE_URL } from '../../../../api/apiConfig';

const API_URL = BASE_URL;

export const companyService = {
  // Récupérer les détails complets d'une entreprise
  getCompanyDetails: async (companyId) => {
    try {
      const response = await axios.get(`${API_URL}/companies/${companyId}`);
      // L'API renvoie { success: true, data: { company, staff, projects, ... } }
      return response.data.data;
    } catch (error) {
      console.error("Erreur companyService.getCompanyDetails:", error);
      throw error;
    }
  },

  // Créer une annonce pour l'entreprise
  createAnnouncement: async (companyId, announcementData) => {
    try {
      const response = await axios.post(`${API_URL}/companies/${companyId}/announcements`, announcementData);
      return response.data;
    } catch (error) {
      console.error("Erreur companyService.createAnnouncement:", error);
      throw error;
    }
  }
};
