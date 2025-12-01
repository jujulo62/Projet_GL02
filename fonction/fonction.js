const path = require('path');
const CRUParser = require('../Parseur/CRUParser');

let analyzer = new CRUParser();

function parseFile() {
    // A completer plus tardd
}

function capaciteSalle(idSalle) {

    if (!idSalle) console.log("L'argument rentré est invalide");

    if (!analyzer.parsedCRU || Object.keys(analyzer.parsedCRU).length === 0) {
        console.log("Veuillez ajouter un fichier à la base de donnée");
        return;
    }

    const creneauxSalle = Object.values(analyzer.parsedCRU).flat().filter(
        creneau => creneau.salle === idSalle
    );

    if (creneauxSalle.length === 0) {
        console.log("Salle introuvable dans les créneaux");
        return;
    }

    let capacity = creneauxSalle.reduce((maxCapa, creneau) =>
        Math.max(maxCapa, creneau.capacite), 0
    );

    console.log(`La capacité maximale de la salle ${idSalle} est de ${capacity} personnes.`);

}

function sallesCours(cours) {

    if (!analyzer.parsedCRU || Object.keys(analyzer.parsedCRU).length === 0) {
        console.log("Veuillez ajouter un fichier à la base de donnée");
        return;
    }

    if (!cours) {
        console.log("L'argument rentré est invalide");
        return;
    }

    if (!analyzer.parsedCRU[cours]) {
        console.log(`Les cours ${cours} est inconnu`);
        return;
    }

    const salles = [...new Set(analyzer.parsedCRU[cours].map(creneau => creneau.salle))].sort();

    // Affichage des salles
    console.log(`Les salles pour le cours ${cours} sont : ${salles.join(', ')}`);
}


function toMinutesArr(hhmm) {
    const [h, m] = hhmm.map(Number);
    return h * 60 + m;
}

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}



// Renvoie les disponibilités d'une salle 
function disponibilitesSalle(salle, heureDebut="8:00", heureFin="20:00") {
    
    if (!salle) {
        console.log("L'argument rentré est invalide");
        return;
    }

    if (!analyzer.parsedCRU || Object.keys(analyzer.parsedCRU).length === 0) {
        console.log("Veuillez ajouter un fichier à la base de donnée");
        return;
    }

    const jours = ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'];
    const debut = toMinutes(heureDebut);
    const fin = toMinutes(heureFin);

    let disponibilites = {};

    for (let jour of jours) {
        let currentTimeMin = debut;
        disponibilites[jour] = [];

        // Récupérer les créneaux pour la salle et le jour donnés
        let creneauxJour = Object.values(analyzer.parsedCRU).flat().filter(
            creneau => creneau.salle === salle && creneau.jour === jour
        );

        // Trier les créneaux par heure de début
        creneauxJour.sort((a, b) => toMinutesArr(a.heureDebut) - toMinutesArr(b.heureDebut));

        for (let creneau of creneauxJour) {
            let creneauDebutMin = toMinutesArr(creneau.heureDebut);
            let creneauFinMin = toMinutesArr(creneau.heureFin);

            if (creneauDebutMin > currentTimeMin) {
                disponibilites[jour].push({
                    debut: `${Math.floor(currentTimeMin / 60)}:${String(currentTimeMin % 60).padStart(2, '0')}`,
                    fin: `${Math.floor(creneauDebutMin / 60)}:${String(creneauDebutMin % 60).padStart(2, '0')}`
                });
            }
            currentTimeMin = Math.max(currentTimeMin, creneauFinMin);
        }


        // On gère jusque fin de journée
        if (currentTimeMin < fin) {
            disponibilites[jour].push({
                debut: `${Math.floor(currentTimeMin / 60)}:${String(currentTimeMin % 60).padStart(2, '0')}`,
                fin: `${Math.floor(fin / 60)}:${String(fin % 60).padStart(2, '0')}`
            });
        }

    }

    // Affichage des disponibilités
    for (let jour of jours) {
        console.log(`Disponibilités pour la salle ${salle} - ${jour} :`.green);
        if (disponibilites[jour].length === 0) {
            console.log("Aucune disponibilité".red);
        } else {
            for (let plage of disponibilites[jour]) {
                console.log(`De ${plage.debut} à ${plage.fin}`.blue);
            }
        }
        console.log("");
    }
}



function salleDisponible(heureDebut, heureFin, jour) {

    let sallesIndisponibles = new Set();
    let sallesListe = new Set();
    let sallesDispo = [];


    if (!heureDebut || !heureFin || !jour) {
        console.log("erreur dans les arguments");
        return;
    }

    if (!analyzer.parsedCRU || Object.keys(analyzer.parsedCRU).length === 0) {
        console.log("Veuillez ajouter un fichier à la base de donnée");
    }

    const debut = toMinutes(heureDebut);
    const fin = toMinutes(heureFin);

    for (const [key, value] of Object.entries(analyzer.parsedCRU)) {
        for (const [key2, value2] of Object.entries(value)) {

            let debut2 = toMinutes(value2.heureDebut);
            let fin2 = toMinutes(value2.heureFin);

            sallesListe.add(value2.salle);

            if (value2.jour === jour && debut < fin2 && fin > debut2) {
                sallesIndisponibles.add(value2.salle);
            }
        }
    }

    for (let salle of sallesListe) {
        if (!sallesIndisponibles.has(salle)) {
            sallesDispo.push(salle);
        }
    }

    return sallesDispo ;
}

function classementCapacite(){
    if (!analyzer.parsedCRU || Object.keys(analyzer.parsedCRU).length === 0) {
        console.log("Veuillez d'abord ajouter un fichier à la base de données.");
        return;
    }

    let sallesUniques = {};

    for (const [ue, creneaux] of Object.entries(analyzer.parsedCRU)) {
        for (const [id, variable] of Object.entries(creneaux)) {
            if (variable.salle && variable.capacite) {

                if(sallesUniques[variable.salle] == undefined){
                    sallesUniques[variable.salle] = parseInt(variable.capacite, 10);
                }else if (sallesUniques[variable.salle] < parseInt(variable.capacite, 10)){
                    sallesUniques[variable.salle] = parseInt(variable.capacite, 10);
                }
            }
        }
    }

    let tableauSalles = Object.entries(sallesUniques).map(([nom, cap]) => {
        return { nom: nom, cap: cap };
    });

    tableauSalles.sort((a, b) => b.cap - a.cap);

    console.log("--- Classement des salles par capacité (Décroissant) ---");
    tableauSalles.forEach(salle => {
        console.log(`Salle : ${salle.nom} - Capacité : ${salle.cap}`);
    });

    return tableauSalles;
}

module.exports = {
    parseFile,
    capaciteSalle,
    sallesCours,
    disponibilitesSalle,
    salleDisponible,
    classementCapacite
}