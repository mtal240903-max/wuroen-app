import React, { createContext, useState, useCallback, useContext } from 'react';
import { workspaceService } from '../services/workspace.service';
import api from '../services/api';

export const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkspaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [spacesRes, invitesRes] = await Promise.all([
        workspaceService.getMyWorkspaces(),
        workspaceService.getPendingInvitations()
      ]);

      if (spacesRes?.success) {
        const list = spacesRes.data || [];
        setWorkspaces(list);
        
        setCurrentWorkspace(prev => {
          if (!prev && list.length > 0) return list[0];
          if (prev && list.length > 0) {
            const exists = list.find(w => w._id === prev._id);
            return exists || list[0];
          }
          return prev;
        });
      }
      if (invitesRes?.success) setPendingInvitations(invitesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyWorkspaces = useCallback(async () => {
    return await loadWorkspaceData();
  }, [loadWorkspaceData]);

  const createNewWorkspace = async (name, plan) => {
    try {
      const res = await workspaceService.createWorkspace(name, plan);
      if (res?.success) await loadWorkspaceData();
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Erreur lors de la création.");
    }
  };

  const createNewCompany = async (formData) => {
    try {
      const response = await api.post('/companies', formData, {
        transformRequest: (data) => data, // 👈 Empêche Axios de convertir le FormData en JSON
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.success) {
        await loadWorkspaceData();
      }
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Erreur lors de la création de la structure.");
    }
  };

  const handleInvitation = async (workspaceId, action) => {
    try {
      const res = await workspaceService.respondToInvitation(workspaceId, action);
      if (res?.success) await loadWorkspaceData();
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Erreur invitation.");
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      pendingInvitations,
      currentWorkspace,
      setCurrentWorkspace,
      loading,
      error,
      loadWorkspaceData,
      fetchMyWorkspaces,
      createNewWorkspace,
      createNewCompany,
      handleInvitation
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace doit être utilisé au sein d'un WorkspaceProvider");
  }
  return context;
};