/**
 * @file roleAuth.js
 * @description Pont de compatibilité — expose des gardes nommées construites sur authMiddleware.js
 *
 * ⚠️  Ce fichier ne contient AUCUNE logique.
 *     Toute modification de comportement se fait dans authMiddleware.js uniquement.
 *
 * @deprecated Migrer vers : const { protect, authorize, authorizeAdminType } = require('./authMiddleware')
 *
 * ⚠️  NE PAS dupliquer la logique ici.
 *     Toute la logique d'auth vit dans UN SEUL endroit : authMiddleware.js
 *     Ce fichier existe uniquement pour les anciennes routes qui importaient roleAuth.js
 *     Il peut être supprimé une fois toutes les routes migrées vers authMiddleware.js
 */

const { protect, authorize, authorizeAdminType } = require('./authMiddleware');

// ─── EXPORTS DIRECTS ────────────────────────────────────────────────────────

// Authentification de base (JWT + vérification ban/suspension)
exports.protect = protect;

// ─── GARDES DE RÔLES SPÉCIFIQUES ────────────────────────────────────────────

/**
 * @desc SuperAdmin uniquement
 * @example router.delete('/nuke', protect, isSuperAdmin, handler)
 */
exports.isSuperAdmin = authorize('superadmin');

/**
 * @desc Admin de la bibliothèque OU SuperAdmin
 * ✅ FIX : 'libraryadmin' n'existe pas dans le modèle User.
 *    Le bon rôle est 'admin' avec adminType === 'library'
 *    On utilise authorizeAdminType qui gère cette logique.
 * @example router.post('/library/upload', protect, isLibraryAdmin, handler)
 */
exports.isLibraryAdmin = authorizeAdminType('library');

/**
 * @desc Admin de contenu OU SuperAdmin
 * @example router.post('/articles/review', protect, isContentAdmin, handler)
 */
exports.isContentAdmin = authorizeAdminType('content');

/**
 * @desc Admin de workspace OU SuperAdmin
 * @example router.post('/workspace', protect, isWorkspaceAdmin, handler)
 */
exports.isWorkspaceAdmin = authorizeAdminType('workspace');

/**
 * @desc Modérateur, Admin ou SuperAdmin
 * @example router.get('/articles/pending', protect, isModerator, handler)
 */
exports.isModerator = authorize('moderator', 'admin', 'superadmin');