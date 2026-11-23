const { calculerFinancesWorkspace } = require('../../../services/financeService');

exports.calculerFinance = async (req, res) => {
    try {
        const donnees = req.body; // Récupère les données du workspace (charges, ventes, etc.)
        const resultats = await calculerFinancesWorkspace(donnees);
        
        res.status(200).json({
            success: true,
            data: resultats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() });
    }
};