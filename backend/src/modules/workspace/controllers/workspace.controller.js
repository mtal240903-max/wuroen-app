const Workspace = require('../models/Workspace');

exports.createWorkspace = async (req, res, next) => {
  try {
    const { name, plan } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Le nom de l'espace est obligatoire." });
    }

    const workspace = await Workspace.create({
      name,
      plan: plan || 'free',
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      message: `L'espace "${workspace.name}" a bien été créé !`,
      data: workspace
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ owner: req.user._id });
    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });
  } catch (error) {
    next(error);
  }
};