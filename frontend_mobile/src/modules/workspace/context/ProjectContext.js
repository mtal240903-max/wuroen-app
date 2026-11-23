import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext'; 
import api from '../../../services/api'; 

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext) || {};

  useEffect(() => {
    if (userToken) {
      loadProjects();
      loadCompanies();
    } else {
      setProjects([]);
      setCompanies([]);
      setLoading(false);
    }
  }, [userToken]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      // Correction : Extraction via .data (selon le format de votre backend)
      const projectList = response.data.data || response.data.projects || response.data;
      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      const companyList = response.data.data || response.data.companies || response.data;
      setCompanies(Array.isArray(companyList) ? companyList : []);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error.message);
    }
  };

  const getCompanyDetails = async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      return response.data.data || response.data; 
    } catch (error) {
      console.error(`Erreur lors du chargement de l'entreprise ${companyId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Impossible de récupérer les détails de la structure.");
    }
  };

  const addCompany = async (newCompanyData) => {
    try {
      const response = await api.post('/companies', newCompanyData);
      const createdCompany = response.data.data || response.data.company || response.data;
      setCompanies(prev => [createdCompany, ...prev]);
      return { success: true, company: createdCompany };
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Impossible de créer la structure.");
    }
  };

  const addProject = async (newProject, currentCompanyId = null) => {
    try {
      const payload = {
        ...newProject,
        companyId: currentCompanyId || newProject.companyId || null,
      };

      const response = await api.post('/projects', payload);
      const createdProject = response.data.data || response.data.project || response.data;

      setProjects(prevProjects => [createdProject, ...prevProjects]);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Impossible de créer le projet sur le serveur.");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId && p.id !== projectId));
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error.response?.data || error.message);
      throw new Error("Impossible de supprimer le projet.");
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      companies, 
      addProject, 
      deleteProject, 
      loadProjects, 
      loadCompanies,
      getCompanyDetails,
      addCompany,
      loading 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};