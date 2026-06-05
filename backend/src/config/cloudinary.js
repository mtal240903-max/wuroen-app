/**
 * @file config/cloudinary.js
 * @description SOURCE UNIQUE de toute la configuration Cloudinary.
 *
 * ❌ NE JAMAIS reconfigurer cloudinary.config() ailleurs dans le projet
 * ✅ Importer uniquement depuis ce fichier :
 *    const { cloudinary, upload, uploadLibrary } = require('../config/cloudinary')
 *
 * Exports disponibles :
 *  - cloudinary      → instance configurée (pour les suppressions manuelles)
 *  - upload          → middleware Multer pour les images d'articles (jpg, png, jpeg)
 *  - uploadLibrary   → middleware Multer pour les documents de bibliothèque (pdf, docx...)
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURATION GLOBALE (une seule fois pour tout le projet)
// ─────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────────────────────
// 2. STORAGE ARTICLES — Images uniquement
// ─────────────────────────────────────────────────────────────
const articleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'wuroen_articles',
    resource_type:   'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1200, height: 630, crop: 'limit', quality: 'auto' }],
    // ✅ Optimise automatiquement les images uploadées (taille + qualité)
  },
});

// ─────────────────────────────────────────────────────────────
// 3. STORAGE BIBLIOTHÈQUE — Documents (PDF, DOCX...)
// ─────────────────────────────────────────────────────────────
const libraryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'wuroen_library',
    resource_type:   'raw',       // ✅ 'raw' = obligatoire pour PDF/DOCX (pas 'auto')
    allowed_formats: ['pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt'],
  },
});

// ─────────────────────────────────────────────────────────────
// 4. LIMITES & FILTRES MULTER
// ─────────────────────────────────────────────────────────────

// ✅ Filtre images — rejet immédiat si ce n'est pas une image
const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${file.mimetype}. Images uniquement (jpg, png, webp).`), false);
  }
};

// ✅ Filtre documents — rejet immédiat si ce n'est pas un document reconnu
const documentFileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword',                                                       // doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',// pptx
    'text/plain',                                                               // txt
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${file.mimetype}.`), false);
  }
};

// ─────────────────────────────────────────────────────────────
// 5. INSTANCES MULTER
// ─────────────────────────────────────────────────────────────

/**
 * @middleware upload
 * @desc Pour les images de couverture d'articles
 * @usage upload.single('image')
 */
const upload = multer({
  storage: articleStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ 5 MB max pour les images
  },
});

/**
 * @middleware uploadLibrary
 * @desc Pour les documents de la bibliothèque (PDF, DOCX, etc.)
 * @usage uploadLibrary.single('file')
 */
const uploadLibrary = multer({
  storage: libraryStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // ✅ 50 MB max pour les documents
  },
});

// ─────────────────────────────────────────────────────────────
// 6. HELPER — Suppression manuelle d'un fichier Cloudinary
// ─────────────────────────────────────────────────────────────

/**
 * Supprime un fichier de Cloudinary de manière sécurisée.
 * À utiliser dans les controllers lors des suppressions en base.
 *
 * @param {string} publicId   - Le cloudinaryId stocké en base
 * @param {string} resourceType - 'image' | 'raw' (défaut: 'raw')
 * @returns {Promise<boolean>} true si supprimé, false si erreur non bloquante
 *
 * @example
 * const { destroyFile } = require('../config/cloudinary');
 * await destroyFile(resource.cloudinaryId, 'raw');
 */
const destroyFile = async (publicId, resourceType = 'raw') => {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn(`⚠️ Cloudinary destroy résultat inattendu pour [${publicId}]:`, result.result);
    }
    return true;
  } catch (err) {
    console.error(`❌ Erreur suppression Cloudinary [${publicId}]:`, err.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = { cloudinary, upload, uploadLibrary, destroyFile };