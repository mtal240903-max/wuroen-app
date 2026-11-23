# Wuro’en Web

Interface web React pour l’espace de recherche Wuro’en. La connexion, les articles, les catégories de bibliothèque, les outils et les espaces utilisent l’API Express du dépôt.

## Démarrer en local

1. Démarrer l’API située dans `../backend` sur le port `5000`.
2. Copier `.env.example` vers `.env.local` et régler `VITE_API_URL` si l’API n’est pas à `http://localhost:5000/api`.
3. Installer les dépendances puis lancer `npm run dev`.

L’application web est disponible à l’adresse locale affichée par Vite. Les jetons de session sont conservés dans `sessionStorage`; le jeton de renouvellement reste dans le cookie HttpOnly fourni par l’API.

## Production

`npm run build` génère le site statique dans `dist/`. Configurer le serveur web pour servir `index.html` sur les routes inconnues et définir `VITE_API_URL` avant la compilation.
