/**
 * Module pour générer le contenu du fichier iCalendar (.ics).
 * Implémente le format décrit dans la SPEC_FONC_5 (RFC 5545).
 */

class ICalendar {
    
    // Convertit une chaîne 'HH:MM' en minutes (utilisé en interne par Creneau.js)
    static toMinutes(hhmm) {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }
    
    // Fonction utilitaire pour convertir un objet Date ou une string "YYYY-MM-DD" en HORAIFRE LOCALE string (YYYYMMDDTHHMMSS)
    static formatDate(date, hhmm, jour) {
        // jour est la position dans la semaine (0=L, 1=MA, 2=ME...)
        const joursSemaine = ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'];
        const targetDayIndex = joursSemaine.indexOf(jour);

        if (targetDayIndex === -1) {
            throw new Error(`Jour non valide: ${jour}`);
        }

        let d = new Date(date);

        // Ajuster la date pour qu'elle corresponde au jour de la semaine du créneau
        // 0=Dimanche, 1=Lundi, ..., 6=Samedi pour getDay()
        let currentDayIndex = (d.getDay() === 0 ? 6 : d.getDay() - 1); 

        while (currentDayIndex !== targetDayIndex) {
            d.setDate(d.getDate() + 1);
            currentDayIndex = (d.getDay() === 0 ? 6 : d.getDay() - 1); 
        }

        const h = parseInt(hhmm.split(':')[0]);
        const m = parseInt(hhmm.split(':')[1]);
        
        // --- CORRECTION CLÉ ---
        // 1. Utiliser setUTCHours pour éviter les effets du fuseau horaire local
        // 2. Ne pas ajouter de décalage (+2), on utilise les heures brutes du fichier CRU (10:00, 14:00, etc.)
        d.setUTCFullYear(d.getFullYear(), d.getMonth(), d.getDate());
        d.setUTCHours(h, m, 0); 
        
        // Formatter en YYYYMMDDTHHMMSS
        const pad = (num) => String(num).padStart(2, '0');

        // On retire le 'Z' de la sortie pour spécifier que c'est une heure locale
        // (Un Z est nécessaire pour DTSTAMP, mais pas pour DTSTART/DTEND non-UTC)
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
    }

    /**
     * Génère un événement VEVENT pour iCalendar
     * @param {Object} creneau - L'objet Creneau
     * @param {string} dateDebutStr - Date de début de la période d'export (YYYY-MM-DD)
     * @param {string} dateFinStr - Date de fin de la période d'export (YYYY-MM-DD)
     * @returns {string} Le contenu du VEVENT
     */
    static generateEvent(creneau, dateDebutStr, dateFinStr) {
        
        // Calculer DTSTART et DTEND pour la première occurrence
        const dtStart = ICalendar.formatDate(dateDebutStr, creneau.heureDebut.join(':'), creneau.jour);
        const dtEnd = ICalendar.formatDate(dateDebutStr, creneau.heureFin.join(':'), creneau.jour);

        // RFC 5545 nécessite DTSTAMP et UID
        // DTSTAMP DOIT être en UTC (d'où le 'Z' à la fin)
        const dtStamp = new Date().toISOString().replace(/[:\-]/g, '').split('.')[0] + 'Z';
        const uid = `${creneau.ue}-${creneau.jour}-${creneau.heureDebut.join('')}-${creneau.salle}@sru-utt.fr`;

        // Conversion YYYY-MM-DD en YYYYMMDD
        const rruleUntil = dateFinStr.replace(/-/g, '');

        // Description/Résumé de l'événement
        const summary = `${creneau.ue} - ${creneau.type} (${creneau.salle})`;
        const location = creneau.salle;
        
        return [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${dtStamp}`,
            // IMPORTANT : Utilisation du format sans Z pour l'heure locale
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `RRULE:FREQ=WEEKLY;UNTIL=${rruleUntil}T235959Z`,
            `LOCATION:${location}`,
            `SUMMARY:${summary}`,
            "END:VEVENT"
        ].join('\n');
    }

    /**
     * Génère le fichier iCalendar complet
     * @param {string} contenuEvents - La concaténation de tous les VEVENTs
     * @returns {string} Le contenu complet du fichier .ics
     */
    static generateICalFile(contenuEvents) {
        // En-tête iCalendar (RFC 5545)
        return [
            "BEGIN:VCALENDAR",
            "VERSION:2.0", // Version du format
            "PRODID:-//SRU//GL02 iCalendar Generator//FR", // ID du produit
            // Ajout du fuseau horaire de l'utilisateur (optionnel mais très recommandé)
            "X-WR-CALNAME:Emploi du temps UTT",
            "CALSCALE:GREGORIAN",
            contenuEvents,
            "END:VCALENDAR" // Fin du format
        ].join('\n');
    }
}

module.exports = ICalendar;