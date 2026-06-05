/**
 * @file middleware/libraryMiddleware/multerErrorHandler.js
 * @desc Middleware Multer pour les uploads bibliothèque
 * Gère les erreurs d'upload et injecte le fichier dans req
 */
const multer = require('multer');
const { uploadLibrary } = require('../../config/cloudinary');

const handleMulterError = (req, res, next) => {
  uploadLibrary.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "Fichier trop volumineux. Maximum 50 MB." });
      }
      return res.status(400).json({ message: "Erreur upload : " + err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message || "Type de fichier non autorisé." });
    }
    next();
  });
};

module.exports = handleMulterError;