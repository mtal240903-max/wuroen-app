import React, { useState } from 'react';
import { PlusCircle, FileText, TrendingUp, Building2, FolderPlus, ArrowRight } from 'lucide-react';

export default function BusinessPlanHome({ projects = [], onCreateNew, onSelectProject }) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [sector, setSector] = useState('Élevage / Agriculture');
  const [coverImage, setCoverImage] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!projectTitle) return;
    
    // Transmission des données du nouveau plan d'affaires
    onCreateNew({
      title: projectTitle,
      sector,
      coverImage,
      createdAt: new Date().toLocaleDateString('fr-FR')
    });
    
    setShowNewModal(false);
    setProjectTitle('');
    setCoverImage(null);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      
      {/* 1. En-tête de la Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plans d'Affaires & Projets</h1>
          <p className="text-sm text-slate-500">Gérez, simulez et suivez la rentabilité financière de vos projets sur Wuro'en.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Nouveau Plan d'Affaires</span>
        </button>
      </div>

      {/* 2. Grille des Projets existants */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <FolderPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">Aucun plan d'affaires pour l'instant</h3>
          <p className="text-sm text-slate-500 mb-6">Commencez par créer votre premier projet pour analyser sa viabilité financière.</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Créer un projet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index}
              onClick={() => onSelectProject(project)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Visuel / Bannière du projet */}
                <div className="h-40 w-full bg-slate-200 relative overflow-hidden">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                      {project.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {project.sector}
                  </span>
                </div>

                {/* Infos du projet */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{project.title}</h3>
                  <p className="text-xs text-slate-400">Créé le {project.createdAt}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-4">
                <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  Voir l'analyse <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Modal de Création d'un Nouveau Plan d'Affaires */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Créer un Plan d'Affaires</h2>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre du Projet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Unité d'élevage avicole moderne"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secteur d'activité</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Élevage & Agriculture">Élevage & Agriculture</option>
                  <option value="Technologie & Logiciel">Technologie & Logiciel</option>
                  <option value="Commerce & Distribution">Commerce & Distribution</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lien de l'image de couverture (URL ou Fichier)</label>
                <input
                  type="text"
                  placeholder="https://exemple.com/image.jpg"
                  value={coverImage || ''}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                >
                  Lancer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}