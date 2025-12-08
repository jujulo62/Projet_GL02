// Créneau d'enseignement (ancien POI)
class Creneau {
	static jours = ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'];

	constructor(type, capacite, jour, hDeb, hFin, index, salle) {
		this.type = type; // Ex: C1, D1, T1
		this.capacite = parseInt(capacite); // Ex: P=24 -> 24
		this.jour = jour; // Ex: L, MA, ME, J, V, S, D-
		this.heureDebut = hDeb; // Ex: 10:00
		this.heureFin = hFin; // Ex: 12:00
		this.index = index; // Ex: F1, F2
		this.salle = salle; // Ex: S=P202
        
        this.ue = null; // Propriété ajoutée pour l'export iCalendar

		this.debutTotMin = Creneau.jours.indexOf(this.jour) * 24 * 60 + parseInt(this.heureDebut[0]) * 60 + parseInt(this.heureDebut[1]);
		this.finTotMin = Creneau.jours.indexOf(this.jour) * 24 * 60 + parseInt(this.heureFin[0]) * 60 + parseInt(this.heureFin[1]);
	}
}


module.exports = Creneau;