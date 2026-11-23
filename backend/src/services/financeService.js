const { exec } = require('child_process');
const path = require('path');

function calculerFinancesWorkspace(donnees) {
    return new Promise((resolve, reject) => {
        const inputJson = JSON.stringify(donnees);
        
        // Chemin vers votre script Python (ajustez selon où vous placez le script Python)
        const scriptPath = path.join(__dirname, '../../wuroen-finance-service/finance_calculator.py');
        
        exec(`python3 "${scriptPath}" '${inputJson}'`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Erreur d'exécution Python: ${error.message}`);
            }
            try {
                const resultat = JSON.parse(stdout);
                resolve(resultat);
            } catch (parseError) {
                reject(`Erreur parsing JSON: ${parseError.message} - Sortie: ${stdout}`);
            }
        });
    });
}

module.exports = { calculerFinancesWorkspace };