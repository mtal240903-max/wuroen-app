/**
 * @file accessControl.js
 * @description Pont de compatibilité — redirige vers authMiddleware.js
 *
 * ⚠️  Ce fichier ne contient AUCUNE logique.
 *     Il existe uniquement pour les anciennes routes qui importaient accessControl.js
 *     Migration recommandée : remplacer tous les imports par authMiddleware.js directement
 *
 * @deprecated Migrer vers : const { protect, authorize } = require('./authMiddleware')
 */

module.exports = require('./authMiddleware');