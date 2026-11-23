import api from '../../../services/api'; // Ajustez le chemin vers votre instance axios

export class OrganizationUnitService {
  async createUnit(input) {
    const response = await api.post('/organization-units', input);
    return response.data;
  }

  async updateUnit(unitId, organizationId, updateData) {
    const response = await api.put(`/organization-units/${unitId}`, {
      organizationId,
      ...updateData,
    });
    return response.data;
  }

  async getSubTree(unitId) {
    const response = await api.get(`/organization-units/${unitId}/subtree`);
    return response.data;
  }
}

export const organizationUnitService = new OrganizationUnitService();