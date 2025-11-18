// Créneau d'enseignement (ancien POI)
var Creneau = function(type, capacite, jour, hDeb, hFin, index, salle){
	this.type = type; // Ex: C1, D1, T1
	this.capacite = parseInt(capacite); // Ex: P=24 -> 24
	this.jour = jour; // Ex: L, MA, ME, J, V, S, D-
	this.heureDebut = hDeb; // Ex: 10:00
	this.heureFin = hFin; // Ex: 12:00
	this.index = index; // Ex: F1, F2
	this.salle = salle; // Ex: S=P202
}



module.exports = Creneau;