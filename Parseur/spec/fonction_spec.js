const {capaciteSalle, sallesCours, disponibilitesSalle, verifierRecouvrements, sallesDisponibles, classementCapacite, tauxOccupation} = require('../../fonction/fonction');
const CRUParser = require('../CRUParser');
const colors = require('colors');




describe("Unit testing of capaciteSalle", function(){

    beforeAll(function() {
        colors.disable(); 
    });

    it("peut trouver la capacité maximale d'une salle existante", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A101")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        capaciteSalle(analyzer, "A101");

        expect(console.log).toHaveBeenCalledWith("La capacité maximale de la salle A101 est de 50 personnes.");
    });

    it("gère le cas où la salle n'existe pas", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A101")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        capaciteSalle(analyzer, "C303");

        expect(console.log).toHaveBeenCalledWith("Salle introuvable");
    });
    

});


describe("Unit testing of sallesCours", function(){

    beforeAll(function() {
        colors.disable(); 
    });

    it("peut trouver les salles pour un cours existant", function(){
        const analyzer = {
            parsedCRU: {
                "LE02": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A102"),
                    new (require('../Creneau'))("D3", 40, "V", ["10", "00"], ["12", "00"], "F3", "A101")
                ],
                "AP1B": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        sallesCours(analyzer, "LE02");

        expect(console.log).toHaveBeenCalledWith("Les salles pour le cours LE02 sont : A101, A102");
    });

    it("gère le cas où le cours n'existe pas", function(){
        const analyzer = {
            parsedCRU: {
                "LE02": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A102"),
                    new (require('../Creneau'))("D3", 40, "V", ["10", "00"], ["12", "00"], "F3", "A101")
                ],
                "AP1B": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        sallesCours(analyzer, "LE99");

        expect(console.log).toHaveBeenCalledWith("Le cours LE99 est inconnu");
    });
    

});


describe("Unit testing of disponibilitesSalle", function(){

    beforeAll(function() {
        colors.disable(); 
    });

    it("peut trouver les disponibilités pour une salle existante", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A101"),
                    new (require('../Creneau'))("D3", 40, "L", ["12", "00"], ["13", "00"], "F3", "A101")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        disponibilitesSalle(analyzer, "A101", "8:00", "18:00");

        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - L :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 9:00");
        expect(console.log).toHaveBeenCalledWith("De 11:00 à 12:00");
        expect(console.log).toHaveBeenCalledWith("De 13:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - MA :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - ME :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - J :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - V :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - S :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
        expect(console.log).toHaveBeenCalledWith("Disponibilités pour la salle A101 - D :");
        expect(console.log).toHaveBeenCalledWith("De 8:00 à 18:00");
    });

    it("gère le cas où la salle n'existe pas", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        disponibilitesSalle(analyzer, "C303", "8:00", "18:00");

        expect(console.log).toHaveBeenCalledWith("La salle C303 est inconnue");
    });

    it("gère le cas où l'heure de début est après l'heure de fin", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                ],
            }
        };

        console.log = jasmine.createSpy("logSpy");

        disponibilitesSalle(analyzer, "A101", "18:00", "8:00");

        expect(console.log).toHaveBeenCalledWith("L'heure de début doit être avant l'heure de fin");
    });

    it("gère le cas où une des heures est invalide", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                ],
            }
        };

        console.log = jasmine.createSpy("logSpy");
        disponibilitesSalle(analyzer, "A101", "invalid", "18:00");
        expect(console.log).toHaveBeenCalledWith("Format invalide. Veuillez utiliser le format HH:MM.");
    });
    

});

describe("Unit testing of verifierRecouvrements", function(){

    beforeAll(function() {
        colors.disable(); 
    });

    it("peut détecter des recouvrements dans une salle", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "L", ["10", "30"], ["12", "00"], "F2", "A101")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        verifierRecouvrements(analyzer);

        expect(console.log).toHaveBeenCalledWith("Recouvrement détecté dans la salle A101 entre les créneaux :".red);
        expect(console.log).toHaveBeenCalledWith(" - L, 9:00 à 11:00 pour UE1".yellow);
        expect(console.log).toHaveBeenCalledWith(" - L, 10:30 à 12:00 pour UE1".yellow);
    });

    it("indique l'absence de recouvrements", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A101")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "V", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        verifierRecouvrements(analyzer);

        expect(console.log).toHaveBeenCalledWith("Aucun recouvrement détecté entre les créneaux.");
    });
    
});



describe("Unit testing of sallesDisponibles", function(){

    beforeAll(function() {
        colors.disable(); 
    });

    it("peut trouver les salles disponibles dans un créneau donné", function(){
        const analyzer = {
            parsedCRU: {
                "UE1": [
                    new (require('../Creneau'))("D1", 30, "L", ["9", "00"], ["11", "00"], "F1", "A101"),
                    new (require('../Creneau'))("D2", 50, "M", ["14", "00"], ["16", "00"], "F2", "A102")
                ],
                "UE2": [
                    new (require('../Creneau'))("D1", 40, "L", ["10", "00"], ["12", "00"], "F3", "B202")
                ]
            }
        };

        console.log = jasmine.createSpy("logSpy");

        sallesDisponibles(analyzer, "L", "8:00", "9:00");

        expect(console.log).toHaveBeenCalledWith("Salles disponibles le L de 8:00 à 9:00 : A101, A102, B202".green);
    });

    
});