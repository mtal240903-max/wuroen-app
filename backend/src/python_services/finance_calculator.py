import sys
import json
import numpy as np
import numpy_financial as npf

def calculer_indicateurs_financiers(investissement_initial, flux_tresorerie, taux_actualisation, charges_fixes, prix_vente_unitaire, cout_variable_unitaire):
    """
    Calcule les principaux indicateurs de rentabilité d'un projet.
    """
    flux_complets = [-investissement_initial] + flux_tresorerie
    van = npf.npv(taux_actualisation, flux_complets)
    tri = npf.irr(flux_complets)
    
    cumul = -investissement_initial
    payback = None
    for i, flux in enumerate(flux_tresorerie):
        cumul += flux
        if cumul >= 0:
            payback = i + 1 - (cumul / flux)
            break

    marge_cv_unitaire = prix_vente_unitaire - cout_variable_unitaire
    taux_mcv = marge_cv_unitaire / prix_vente_unitaire if prix_vente_unitaire > 0 else 0
    seuil_rentabilite_ca = charges_fixes / taux_mcv if taux_mcv > 0 else 0

    return {
        "VAN": round(van, 2),
        "TRI (%)": round(tri * 100, 2) if not np.isnan(tri) else None,
        "Payback (années)": round(payback, 2) if payback else "Non récupéré",
        "Seuil de Rentabilité (CA)": round(seuil_rentabilite_ca, 2)
    }

def generer_compte_resultat(volumes_ventes, prix_vente_unitaire, charges_fixes_exploitation, cout_variable_unitaire, taux_impot=0.25, charges_financieres=0):
    """
    Génère un compte de résultat prévisionnel sur plusieurs années.
    """
    compte_resultat = []
    
    for annee, volume in enumerate(volumes_ventes, start=1):
        ca = volume * prix_vente_unitaire
        charges_variables = volume * cout_variable_unitaire
        marge_cv = ca - charges_variables
        rbe = marge_cv - charges_fixes_exploitation
        rai = rbe - charges_financieres
        impot = rai * taux_impot if rai > 0 else 0
        resultat_net = rai - impot
        
        compte_resultat.append({
            "Année": annee,
            "Chiffre d'Affaires": round(ca, 2),
            "RBE (EBITDA)": round(rbe, 2),
            "Résultat Net": round(resultat_net, 2)
        })
        
    return compte_resultat

if __name__ == "__main__":
    try:
        # Récupération des données envoyées en JSON (par exemple depuis Node.js) ou valeurs par défaut
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            # Données de test par défaut
            input_data = {
                "investissement_initial": 50000,
                "flux_tresorerie": [15000, 20000, 25000, 30000, 30000],
                "taux_actualisation": 0.08,
                "charges_fixes": 40000,
                "prix_vente_unitaire": 100,
                "cout_variable_unitaire": 40,
                "volumes_ventes": [1000, 1200, 1500, 1800, 2000],
                "taux_impot": 0.25,
                "charges_financieres": 2000
            }

        indicateurs = calculer_indicateurs_financiers(
            input_data["investissement_initial"],
            input_data["flux_tresorerie"],
            input_data["taux_actualisation"],
            input_data["charges_fixes"],
            input_data["prix_vente_unitaire"],
            input_data["cout_variable_unitaire"]
        )

        compte_resultat = generer_compte_resultat(
            input_data["volumes_ventes"],
            input_data["prix_vente_unitaire"],
            input_data["charges_fixes"],
            input_data["cout_variable_unitaire"],
            input_data.get("taux_impot", 0.25),
            input_data.get("charges_financieres", 0)
        )

        # Affichage du résultat final au format JSON pour que Node.js puisse le récupérer facilement
        output = {
            "indicateurs_rentabilite": indicateurs,
            "compte_resultat_previsionnel": compte_resultat
        }
        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)