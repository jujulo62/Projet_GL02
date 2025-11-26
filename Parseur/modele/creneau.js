

class Creneau {
    static daysList = ["L", "MA", "ME", "J", "V", "S", "D"];

    constructor(type, nbStudents, index, day, startHour, startMinute, endHour, endMinute) {

        if (startHour > endHour || (startHour === endHour && startMinute > endMinute)) {
            throw new Error("Start doit etre avant end");
        }


        this.day = day;

        this.dayIndex = Creneau.daysList.indexOf(day);
        if (this.dayIndex === -1) {
            throw new Error("Char jour invalide" + day);
        }

        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;
        this.nbStudents = nbStudents;
        this.type = type;
        this.index = index;

        this.room = null;
        this.ue = null;

        // Normaliser en minutes pour check plus facilement les overlaps
        this.startTotalMinutes = this.dayIndex * (60 * 24) + startHour * 60 + startMinute;
        this.endTotalMinutes = this.dayIndex * (60 * 24) + endHour * 60 + endMinute;
    }

    static nonAttributed(dayIndex, startHour, startMinute, endHour, endMinute) {
        let c = new Creneau(null, null, null, Creneau.daysList[dayIndex], startHour, startMinute, endHour, endMinute);
        return c;
    }

    isAttributed() {
        return this.room !== null && this.ue !== null;
    }

    overlapsWith(other) {
        return !(this.endTotalMinutes <= other.startTotalMinutes || this.startTotalMinutes >= other.endTotalMinutes);
    }

}

module.exports = Creneau;