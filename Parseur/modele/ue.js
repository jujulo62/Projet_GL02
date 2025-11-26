class UE {
    constructor(name) {
        this.name = name;
        this.creneaux = [];
    }

    addCreneau(newCreneau) {
        // Check overlaps avec les créneaux existants
        for (let creneau of this.creneaux) {
            if (newCreneau.overlapsWith(creneau)) {
                throw new Error("Creneau overlaps with an existing one for this UE");
            }
        }
        this.creneaux.push(newCreneau);
    }


    getRooms() {
        const rooms = new Set();
        for (let creneau of this.creneaux) {
            rooms.add(creneau.room);
        }
        return Array.from(rooms);
    }


}

module.exports = UE;