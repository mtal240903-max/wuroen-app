const OrganizationUnit = require('../../models/OrganizationUnit');
const { createOrganizationUnitSchema } = require('../../validators/organization-unit.validator');

const createUnitController = async (req, res) => {
  try {
    const validationResult = createOrganizationUnitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: validationResult.error.errors,
      });
    }

    const { 
      organizationId, 
      parentId, 
      name, 
      slug, 
      description, 
      managerId, 
      type, 
      inheritPermissions, 
      metadata 
    } = validationResult.data;

    let computedPath = '';

    if (parentId) {
      const parent = await OrganizationUnit.findOne({
        _id: parentId,
        organizationId: organizationId,
        deletedAt: null,
      });

      if (!parent) {
        return res.status(400).json({ success: false, message: "Unité parente invalide ou introuvable." });
      }
      computedPath = parent.path;
    }

    // Création d'une instance temporaire pour récupérer l'ID généré
    const unit = new OrganizationUnit({
      organizationId,
      parentId: parentId || null,
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      managerId: managerId || null,
      type: type || 'DEPARTMENT',
      inheritPermissions: inheritPermissions ?? true,
      metadata: metadata || {},
    });

    // Calcul direct du path final avant l'enregistrement unique
    if (!computedPath || computedPath === 'ROOT') {
      unit.path = unit._id.toString();
    } else {
      unit.path = `${computedPath}/${unit._id}`;
    }

    await unit.save();

    return res.status(201).json({
      success: true,
      message: "Unité organisationnelle créée avec succès",
      data: unit,
    });
  } catch (error) {
    console.error("[CONTROLLER ERROR] Erreur lors de la création :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSubTreeController = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await OrganizationUnit.findOne({ _id: id, deletedAt: null });

    if (!unit) {
      return res.status(404).json({ success: false, message: "Unité introuvable." });
    }

    const subTree = await OrganizationUnit.find({
      path: { $regex: `^${unit.path}` },
      deletedAt: null,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: subTree,
    });
  } catch (error) {
    console.error("[CONTROLLER ERROR] Erreur arborescence :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUnitController,
  getSubTreeController,
};