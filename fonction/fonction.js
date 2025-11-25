const fs = require('fs');
const path = require('path');
const CRUParser = require('../Parseur/CRUParser');

let analyzer = new CRUParser();

function parseFile(){
    // A completer plus tardd
}

function capaciteSalle(idSalle){
    var capacity=-1;

    if(!idSalle) console.log("L'argument rentré est invalide");

    if (analyzer.parsedCRU == {} ){
        console.log("Veuillez ajouter un fichier à la base de donnée");
    }

	for(const[key,value]  of Object.entries(analyzer.parsedCRU)){
		console.log("UE : %s\n",key);
		for(const[key2,value2] of Object.entries(value)){
			// console.log(value2.salle)
            // Pour que je me fonctionne comment ca marche

            if (value2.salle == idSalle){
                capacity=value2.capacite
            }
		}
	}



    if(capacity===-1){
        console.log("La salle n'est pas trouvé")
        return;
    }else{
        console.log("la salle numero %s a une capacité de %d",idSalle,capacity)
        return;
    }
    




    
}

module.exports = { capaciteSalle };