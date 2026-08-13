const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const { userId, level, position, permissions } = req.body;
    const companyId = req.params.id;
    const currentUserId = req.user.id || req.user._id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    // 🔒 1. Seul le propriétaire peut ajouter du personnel
    if (company.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    // 🔒 2. Interdiction de s'ajouter soi-même
    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: "Action invalide." });
    }

    // 🔒 3. Validation des permissions
    const validPermissions = ['manage_members', 'create_project', 'approve_document', 'manage_finance', 'publish_content'];
    if (permissions && permissions.some(p => !validPermissions.includes(p))) {
      return res.status(400).json({ success: false, message: "Permissions invalides." });
    }

    const newStaffMember = {
      userId,
      level: level || 'member',
      position: position ? position.trim() : "Employé",
      memberStatus: 'active_member',
      permissions: permissions || []
    };

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    await Company.findByIdAndUpdate(
      companyId,
      {
        $push: { 
          staff: newStaffMember,
          auditLog: { 
            action: 'STAFF_HIRED', 
            performedBy: currentUserId, 
            ipAddress,
            details: { staffId: userId, assignedLevel: level } 
          } 
        }
      },
      { new: true }
    );

    return res.status(201).json({ success: true, data: newStaffMember });
  } catch (error) {
    console.error("Erreur lors de l'ajout du collaborateur :", error);
    return res.status(500).json({ success: false, message: "Erreur lors de l'ajout", error: error.message });
  }
};