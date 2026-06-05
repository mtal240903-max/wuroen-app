const Article = require('../../models/Article');

module.exports = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: "Article scientifique non trouvé" });
        }

        // On vérifie si l'ID de l'utilisateur est déjà dans le tableau des likes
        const index = article.likes.findIndex(id => id.toString() === req.user.id.toString());

        if (index === -1) {
            // L'utilisateur n'a pas encore liké -> On ajoute le like
            article.likes.push(req.user.id);
        } else {
            // L'utilisateur a déjà liké -> On retire le like (Unlike)
            article.likes.splice(index, 1);
        }

        await article.save();
        
        // On renvoie l'article mis à jour pour le frontend
        return res.json(article);

    } catch (error) {
        console.error("Erreur Like:", error);
        return res.status(500).json({ message: "Erreur lors de l'interaction avec le serveur" });
    }
};