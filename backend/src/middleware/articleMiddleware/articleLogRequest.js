module.exports = (req, res, next) => {
    console.log("📥 body reçu:", JSON.stringify(req.body));
    console.log("📎 fichier:", req.file ? req.file.originalname : "aucun");
    return next();
};