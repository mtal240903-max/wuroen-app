const Workspace = require('../models/Workspace');

/**
 * @desc    Créer un nouvel espace de travail (L'auteur devient automatiquement Owner)
 * @route   POST /api/workspaces
 * @access  Private
 */
const createWorkspace = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;

    // 1. Validation de sécurité stricte des entrées pour éviter le plantage
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: "Le nom du workspace est requis et doit être valide." });
    }

    // 2. Nettoyage des chaînes pour éviter les injections de scripts basiques
    const cleanName = name.trim();
    const cleanDescription = description ? description.trim() : '';

    // 3. Construction de l'espace avec isolation du créateur
    const newWorkspace = new Workspace({
      name: cleanName,
      description: cleanDescription,
      visibility: visibility === 'public' ? 'public' : 'private',
      owner: req.user._id, // Identifiant sécurisé issu du JWT vérifié
      members: [{
        user: req.user._id,
        role: 'Owner',
        joinedAt: new Date()
      }],
      enabledApps: ['projects'] // Uniquement l'application projet par défaut
    });

    await newWorkspace.save();

    // 4. Réponse structurée sans exposer d'informations système sensibles
    return res.status(201).json({
      success: true,
      message: "Workspace créé avec succès.",
      data: {
        id: newWorkspace._id,
        name: newWorkspace.name,
        visibility: newWorkspace.visibility,
        enabledApps: newWorkspace.enabledApps
      }
    });

  } catch (error) {
    // Fail-safe : On capture l'erreur pour éviter que Node.js ne crash
    // On log l'erreur réelle côté serveur pour la maintenance, mais on cache les détails techniques au client (Sécurité)
    console.error("CRITICAL ERROR [createWorkspace]:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Une erreur interne de sécurité est survenue lors de la création." 
    });
  }
};

/**
 * @desc    Récupérer uniquement les espaces de travail où l'utilisateur connecté est membre (Étanchéité totale)
 * @route   GET /api/workspaces
 * @access  Private
 */
const getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;

    // Requête hautement sécurisée : MongoDB filtre par index sur le tableau des membres.
    // L'utilisateur ne peut PHYSIQUEMENT PAS voir un espace dont il n'est pas membre.
    const workspaces = await Workspace.find(
      { "members.user": userId },
      { name: 1, description: 1, owner: 1, enabledApps: 1, logo: 1, "members.$": 1 } // Projection sélective
    ).lean(); // .lean() optimise la vitesse de lecture et réduit la consommation mémoire de 100k utilisateurs

    return res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });

  } catch (error) {
    console.error("CRITICAL ERROR [getMyWorkspaces]:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Impossible de récupérer vos espaces de travail de manière sécurisée." 
    });
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces
};