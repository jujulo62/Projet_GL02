const Creneau = require("./creneau");
const UE = require("./ue");

class Salle {
    constructor(name) {
        this.name = name;
        this.creneaux = [];
        this.capacity = 0;
    }

    addCreneau(creneau) {
        if (!this.isAvailableAtCreneau(creneau)) {
            throw new Error("Créneau chevauche un créneau existant pour la salle " + this.name);
        }
        this.creneaux.push(creneau);

        // Mettre à jour la capacité de la salle si nécessaire
        if (creneau.nbStudents > this.capacity) {
            this.capacity = creneau.nbStudents;
        }
    }

    // Retoourne les créneaux disponibles dans la salle entre les horaires données pour n'importe quel jour
    getAvailableSlots(minHour, minMinute, maxHour, maxMinute) {

        if (minHour > maxHour || (minHour === maxHour && minMinute >= maxMinute)) {
            throw new Error("Début doit être avant la fin");
        }

        // Sort les créneaux par temps
        this.creneaux.sort((a, b) => a.startTotalMinutes - b.startTotalMinutes);


        const availableSlots = [];
        let lastCreneau = Creneau.nonAttributed(0, 0, 0, 0, 0); // Créneau fictif au début de la semaine

        for (let creneau of this.creneaux.concat([Creneau.nonAttributed(6, 23, 60, 23, 60)])) { // On ajoute un créneau fictif à la fin de la semaine pour capturer les slots finaux


            let lastEndMinute = lastCreneau.endMinute
            let lastEndHour = lastCreneau.endHour
            let lastDay = lastCreneau.dayIndex

            // Traite les jours entre deux
            while (lastDay < creneau.dayIndex) {
                const startMinute = Math.max(lastEndMinute, minMinute);
                const startHour = Math.max(lastEndHour, minHour);

                const endMinute = maxMinute;
                const endHour = maxHour;

                if (startHour < endHour || (startHour == endHour && startMinute < endMinute)) {
                    availableSlots.push(Creneau.nonAttributed(lastDay, startHour, startMinute, endHour, endMinute, 0));
                }

                lastDay += 1
                lastEndHour = minHour
                lastEndMinute = minMinute
            }


            const startHour = Math.max(lastEndHour, minHour);
            const startMinute = startHour == minHour ? Math.max(lastEndMinute, minMinute) : lastEndMinute;


            const endHour = Math.min(creneau.startHour, maxHour);
            const endMinute = endHour == maxHour ? Math.min(creneau.startMinute, maxMinute) : creneau.startMinute;

            if (startHour < endHour || (startHour == endHour && startMinute < endMinute)) {
                availableSlots.push(Creneau.nonAttributed(lastDay, startHour, startMinute, endHour, endMinute));
            }

            lastCreneau = creneau

        }


        return availableSlots;
    }

    isAvailableAtCreneau(creneau) {
        for (let existingCreneau of this.creneaux) {
            
            if (creneau.overlapsWith(existingCreneau)) {
                return false;
            }
        }
        return true;
    }
}


module.exports = Salle;


// // // Test
// const ue1 = new UE("MM01")
// const room1 = new Salle("C201")

// // constructor(type, nbStudents, index, day, startHour, startMinute, endHour, endMinute)

// const creneau1 = new Creneau("C1", 14, 12, "L", 8, 0, 10, 0, room1, ue1, 50)
// const creneau2 = new Creneau("T1", 14, 12, "L", 10, 0, 12, 0, room1, ue1, 50)
// // Overlap test
// // const creneau3 = new Creneau("F1", 14, 12, "L", 9, 0, 11, 0, room1, ue1, 50)
// ue1.addCreneau(creneau1)
// room1.addCreneau(creneau1)
// ue1.addCreneau(creneau2)
// room1.addCreneau(creneau2)
// // ue1.addCreneau(creneau3)
// // room1.addCreneau(creneau3)
// room1.getAvailableSlots(8, 0, 18, 0).forEach(slot => {
//     console.log(`Available slot in room ${room1.name} on day ${slot.day} from ${slot.startHour}:${slot.startMinute} to ${slot.endHour}:${slot.endMinute}`);
// });



// console.log(ue1.getRooms())
