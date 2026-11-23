const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    console.log("Données reçues (body) :", req.body);
    console.log("Fichiers reçus (files/file) :", req.files || req.file);
    console.log("Utilisateur ID détecté :", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié." });
    }

    const { name, description, type, sector, location, investment, staffCount, website, isPublic } = req.body;

    // Gestion de la photo de couverture (bgImage)
    let bgImage = req.body.bgImage || "";
    if (req.files && req.files.bgImage && req.files.bgImage[0]) {
      bgImage = req.files.bgImage[0].path || req.files.bgImage[0].filename;
    } else if (req.file && req.fieldname === 'bgImage') {
      bgImage = req.file.path || req.file.filename;
    }

    // Gestion du logo (logo)
    let logo = req.body.logo || "";
    if (req.files && req.files.logo && req.files.logo[0]) {
      logo = req.files.logo[0].path || req.files.logo[0].filename;
    } else if (req.file && req.fieldname === 'logo') {
      logo = req.file.path || req.file.filename;
    }

    // Rétrocompatibilité si un fichier unique générique est envoyé
    if (!bgImage && req.file && !req.fieldname) {
      bgImage = req.file.path || req.file.filename;
    }

    const company = await Company.create({
      user: userId, 
      name: name?.trim(),
      description: description?.trim(),
      type,
      sector: sector || 'Primaire', 
      location: location?.trim() || 'Non spécifié', 
      investment: investment || '0M',
      staffCount: parseInt(staffCount, 10) || 0,
      website: website || "",
      bgImage,
      logo, // ➕ Enregistrement du logo de la structure
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