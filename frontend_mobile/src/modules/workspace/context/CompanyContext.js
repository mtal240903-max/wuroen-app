import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import api from '../../../services/api'; // Ajustez le chemin selon l'emplacement de votre fichier

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🛡️ Verrou anti-spam pour bloquer les requêtes trop rapprochées (évite le code 429)
  const lastFetchRef = useRef(0);

  // Charger toutes les entreprises depuis le serveur
  const loadCompanies = useCallback(async (force = false) => {
    const now = Date.now();
    // Ignore si un appel a été fait il y a moins de 5 secondes (sauf si force = true)
    if (!force && now - lastFetchRef.current < 5000) {
      return companies;
    }
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/companies');
      const fetchedCompanies = response.data?.data || response.data?.companies || response.data || [];
      setCompanies(fetchedCompanies);
      return fetchedCompanies;
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || "Erreur de récupération.";
      setError(apiMessage);
      throw apiMessage;
    } finally {
      setLoading(false);
    }
  }, [companies]);

  // Créer une nouvelle entreprise (avec support FormData si envoi d'image)
  const createCompany = async (companyPayload) => {
    try {
      const isFormData = companyPayload instanceof FormData;
      
      // Configuration de la requête : si c'est un FormData, on ne spécifie PAS le Content-Type 
      // pour laisser Axios générer la boundary multipart automatiquement.
      const config = isFormData ? {} : {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await api.post('/companies', companyPayload, config);

      if (response.status === 201 || response.status === 200) {
        await loadCompanies(true);
      }
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement.";
      throw new Error(errorMsg);
    }
  };

  return (
    <CompanyContext.Provider value={{
      companies,
      loading,
      error,
      loadCompanies,
      createCompany
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany doit être utilisé dans un CompanyProvider");
  }
  return context;
};