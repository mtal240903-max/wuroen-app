import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext'; // Ajustez le chemin selon votre structure
import api from '../../../services/api'; // Votre instance axios configurée avec BASE_URL

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext) || {};

  useEffect(() => {
    if (userToken) {
      loadProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [userToken]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      // Adaptez selon la structure de réponse de votre backend (ex: response.data ou response.data.projects)
      setProjects(response.data.projects || response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets depuis le serveur:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (newProject, currentCompanyId = null) => {
    try {
      const payload = {
        ...newProject,
        companyId: currentCompanyId || newProject.companyId || null,
      };

      const response = await api.post('/projects', payload);
      const createdProject = response.data.project || response.data;

      // Met à jour l'état local avec le projet renvoyé par le serveur
      setProjects(prevProjects => [createdProject, ...prevProjects]);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet sur le serveur:", error.response?.data || error.message);
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
    <ProjectContext.Provider value={{ projects, addProject, deleteProject, loadProjects, loading }}>
      {children}
    </ProjectContext.Provider>
  );
};