const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    console.log("Données reçues (body) :", req.body);
    console.log("Fichier reçu (file) :", req.file);
    console.log("Utilisateur ID détecté :", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié." });
    }

    const { name, description, type, sector, location, investment, staffCount, website, isPublic } = req.body;

    // Gestion de l'image (si envoyée via multer ou lien direct)
    let bgImage = req.body.bgImage || "";
    if (req.file) {
      bgImage = req.file.path || req.file.filename || bgImage;
    }

    const company = await Company.create({
      user: userId, 
      name: name?.trim(),
      description: description?.trim(),
      type,
      sector: sector || 'Primaire', // Valeur de secours si non définie
      location: location?.trim() || 'Non spécifié', // Valeur de secours si non définie
      investment: investment || '0M',
      staffCount: parseInt(staffCount, 10) || 0,
      website: website || "",
      bgImage,
      isPublic: isPublic === 'true' || isPublic === true,
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: "Structure créée avec succès",
      data: company
    });

  } catch (error) {
    console.error("Erreur critique Company.create :", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Erreur de validation des données. Vérifiez que le type et le secteur choisis correspondent exactement aux options autorisées.",
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la création de la structure.",
      error: error.message 
    });
  }
};