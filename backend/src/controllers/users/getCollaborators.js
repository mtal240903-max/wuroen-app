// src/controllers/userController/getCollaborators.js
const User = require('../../models/User'); // Adaptez selon votre modèle

const getCollaborators = async (req, res) => {
    try {
        // Exemple : récupérer tous les utilisateurs sauf celui qui demande
        const users = await User.find({ _id: { $ne: req.user._id } }).select('name specialty');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = getCollaborators;