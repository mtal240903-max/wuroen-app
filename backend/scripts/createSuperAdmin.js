const mongoose = require('mongoose');
const User = require('../src/models/User'); // Vérifie bien le chemin
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    // 1. Connexion MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/wuroen";
    await mongoose.connect(mongoURI);
    console.log("📡 Connecté à MongoDB...");

    // 2. Données du SuperAdmin
    const adminData = {
      name: "MTaL", // ⚠️ adapte selon ton schema (username ou name)
      email: "mtal240903@gmail.com",
      password: "YDHCHMI M.C.10(FCB) Wuro'en_MTaL", // ⚠️ PAS de hash ici
      role: "superadmin",
      isVerified: true,
      specialty: "Administration Système"
    };

    // 3. Vérifier si déjà existant
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("⚠️ Un utilisateur avec cet email existe déjà.");
      console.log("👉 Supprime-le d'abord ou change l'email.");
      process.exit();
    }

    // 4. Création (le hash se fait AUTOMATIQUEMENT dans le modèle)
    const newAdmin = new User(adminData);
    await newAdmin.save();

    console.log("✅ SuperAdmin créé avec succès !");
    console.log("📧 Email :", adminData.email);
    console.log("🔑 Mot de passe :", adminData.password);

  } catch (error) {
    console.error("❌ Erreur lors de la création :", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

createSuperAdmin();