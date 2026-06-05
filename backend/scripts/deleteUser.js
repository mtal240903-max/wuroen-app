const mongoose = require('mongoose');
const User = require('../src/models/User'); 
require('dotenv').config();

const deleteUserByEmail = async (email) => {
  if (!email) {
    console.log("❌ Erreur : Veuillez fournir un email (ex: node scripts/deleteUser.js test@test.com)");
    process.exit();
  }

  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/wuroen";
    await mongoose.connect(mongoURI);
    console.log("📡 Connecté à MongoDB...");

    const result = await User.findOneAndDelete({ email: email });

    if (result) {
      console.log(`✅ Utilisateur avec l'email [${email}] supprimé avec succès.`);
    } else {
      console.log(`⚠️ Aucun utilisateur trouvé avec l'email [${email}].`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

// Récupère l'email passé en argument dans le terminal
const emailArg = process.argv[2];
deleteUserByEmail(emailArg);