const Tool = require('../../models/outils_models/Tool');

// @desc    Récupérer tous les outils
// @route   GET /api/tools
// @access  Private
exports.getTools = async (req, res) => {
  try {
    const tools = await Tool.find().sort({ createdAt: -1 });
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ajouter un nouvel outil
// @route   POST /api/tools
// @access  Private/SuperAdmin
exports.createTool = async (req, res) => {
  try {
    const { name, description, category, status, logo, actionType, actionUrl } = req.body;

    const newTool = await Tool.create({
      name,
      description,
      category,
      status,
      logo,
      actionType,
      actionUrl,
    });

    res.status(201).json(newTool);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un outil
// @route   PUT /api/tools/:id
// @access  Private/SuperAdmin
exports.updateTool = async (req, res) => {
  try {
    const updatedTool = await Tool.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTool) {
      return res.status(404).json({ success: false, message: "Outil introuvable." });
    }

    res.status(200).json(updatedTool);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un outil
// @route   DELETE /api/tools/:id
// @access  Private/SuperAdmin
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: "Outil introuvable." });
    }

    res.status(200).json({ success: true, message: "Outil supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};