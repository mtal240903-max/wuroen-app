const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const { name, description, type, sector, location, investment, staffCount, website, isPublic, status } = req.body;
    const companyId = req.params.id;
    const userId = req.user.id || req.user._id;

    const company = await Company.findOne({ _id: companyId });
    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    // 🔒 Sécurité : Seul le propriétaire de l'entreprise peut modifier ses informations
    if (company.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Action refusée. Vous n'êtes pas le propriétaire de cette structure." });
    }

    // Gestion de l'image (si envoyée via multer ou lien direct)
    let bgImage = req.body.bgImage;
    if (req.file) {
      bgImage = req.file.path || req.file.filename || bgImage;
    }

    if (name) company.name = name.trim();
    if (description) company.description = description.trim();
    if (type) company.type = type;
    if (sector) company.sector = sector;
    if (location) company.location = location.trim();
    if (investment) company.investment = investment;
    if (staffCount !== undefined) company.staffCount = parseInt(staffCount, 10) || 0;
    if (website !== undefined) company.website = website;
    if (bgImage !== undefined) company.bgImage = bgImage;
    if (isPublic !== undefined) company.isPublic = isPublic === 'true' || isPublic === true;
    if (status) company.status = status;

    await company.save();

    // Log d'audit
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await Company.findByIdAndUpdate(companyId, {
      $push: { 
        auditLog: { 
          action: 'COMPANY_UPDATED', 
          performedBy: userId, 
          ipAddress, 
          details: req.body 
        } 
      }
    });

    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la modification de l'entreprise", error: error.message });
  }
};