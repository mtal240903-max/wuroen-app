const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wuroen_library', // 📂 Un dossier dédié pour ne pas mélanger avec les articles
    resource_type: 'auto',    // ✨ Pour que Cloudinary accepte les fichiers non-images
    allowed_formats: ['pdf'], // ✅ On commence par le PDF
  },
});

const uploadLibrary = multer({ storage: storage });

module.exports = uploadLibrary;