const Creneau = require("./modele/creneau");
const UE = require("./modele/ue");
const Salle = require("./modele/salle");

// CRUParser

var CRUParser = function (sTokenize, sParsedSymb) {
	// The list of POI parsed from the input file.

	this.mapUEs = {}; // Nouvelle structure de données (NomUE -> Objet UE) ON associe le nom de l'UE à l'objet UE
	this.mapSalles = {}; // Nouvelle structure de données (NomSalle -> Objet Salle) ON associe le nom de la Salle à l'objet Salle


	this.symb = ["+", ",", "P=", "H=", "-", "S=", "//", ":", "/"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CRUParser.prototype.tokenize = function(data){

	// Séparateurs : retour à la ligne, ',', 'P=', 'H=', '-', 'S=', '//', ':'
	// On garde les séparateurs importants pour le parsing
    const separator = /(\r\n|\n|\r|,| |:|P=|H=|-|S=|\/\/|\/|\+)/g; // Ajout de '|+' pour le +UE du des cours
	data = data.split(separator);
	data = data.filter((val) => val.trim() !== ''); // Supprime les éléments vides

    // On retire le texte du début, inintéressant.
    const firstPlus = data.indexOf("+");
	if (firstPlus !== -1){
		data = data.slice(firstPlus)
	}


	return data;
}

CRUParser.prototype.dataPrinter = function (data) {
	let tData = this.tokenize(data);
	for (let ith of tData) {
		console.log(ith);
	}
	if (!tData) {
		console.log("No data to print");
	}
	return true
}

// parse : analyze data by calling the first non terminal rule of the grammar
CRUParser.prototype.parse = function (data) {
	let tData = this.tokenize(data);
	if (this.showTokenize) {
		console.log(tData);
	}
	// La boucle se fait dans la fonction cours() maintenant, car il n'y a plus de symbole de fin .
	this.cours(tData);
	this.getParsed()
	if (tData.length > 0) {
		this.errMsg("Unused tokens remaining, file incomplete or malformed", tData);
	}

}

CRUParser.prototype.getParsed = function () {
	for (const [key, value] of Object.entries(this.mapUEs)) {
		console.log("UE Name : ", key);
		console.log("Creneaux : ");
		for (let creneau of value.creneaux) {
			console.log("  Type : ", creneau.type, ", Day : ", creneau.day, ", Start : ", creneau.startHour + "h" + creneau.startMinute, ", End : ", creneau.endHour + "h" + creneau.endMinute, ", Room : ", creneau.room.name);
		}
		console.log("=======================================");
	}
}

// <Cours> = '+' UE CRLF 1*(<Créneau> '//' CRLF)
CRUParser.prototype.cours = function (input) {
	if (input.length === 0) return false;

	while (input.length > 0 && input[0] !== "+") {
		this.next(input); // on jette ce token si ce n'est pas un +UE
	}

	if (input.length === 0) return false;

	if (this.check("+", input)) {

		this.expect("+", input);
		let ueName = this.ue(input); // Récupère le nom de l'UE
		//Vérification d'erreur OU de l'UE test
		if (ueName === "UE_ERR") {
			this.errMsg("Invalid UE name", input);
			return false;
		} else if (ueName === "UE_TEST") {
			this.next(input);
			return this.cours(input);
		}


		this.mapUEs[ueName] = new UE(ueName); // Initialise l'UE dans la structure de données
		// Si l'UE existait déjà -> voir si mettre une erreur ou autre


		// Lecture des créneaux associés
		while (this.checkSTR("1", input) && input.length > 0) {//expect car on retire le "1"
			this.next(input);
			const creneau = this.creneau(input);
			if (!creneau) {
				this.errMsg("Invalid creneau format.", input);
				return false;
			}

			// Ajout du créneau à l'UE, et attribution de l'UE au créneau
			this.mapUEs[ueName].addCreneau(creneau);
			creneau.ue = this.mapUEs[ueName];

			// Gestion des créneaux supplémentaires pour le même cours
			while (this.checkSTR("/", input)) {
				this.expect("/", input);
				const creneauSup = this.creneauSup(input, creneau);
				this.mapUEs[ueName].addCreneau(creneauSup);
				creneauSup.ue = this.mapUEs[ueName];
			}
			this.expect("//", input); // Fin d'un Créneau
		}
		if (this.mapUEs[ueName].creneaux.length === 0) {
			this.errMsg("No creneau found for UE " + ueName, input);
		}
		// Si le tableau d'entrée n'est pas vide, on cherche le prochain cours
		if (input.length > 0) {
			this.cours(input);
		}

		return true;
	}
}
// <UE> = 2*4UPPERALPHA 2DIGIT
CRUParser.prototype.ue = function (input) {
	let curS = this.next(input);
	if (curS === "UVUV") {
		return "UE_TEST"
	} else if (!curS) {
		return "UE_ERR"
	}
	return curS;
}

// <Créneau> = ‘1,’ <Type> ‘,’ <Capa> ‘,’ <Horaire> ‘,’ <Index> ‘,’ <Salle>
CRUParser.prototype.creneau = function (input) {

	const type = this.type(input);
	const capa = this.capa(input);
	const [jour, [heureDeb, minDeb], [heureFin, minFin]] = this.horaire(input) ?? [];
	const index = this.index(input);
	const salle = this.salle(input);
	if (!type || !capa || !jour || !index || !salle) {
		this.errMsg("Invalid creneau format.", input);
		return false;
	}

	// Check si la salle est déjà register, sinon on la crée
	if (!this.mapSalles[salle]) {
		this.mapSalles[salle] = new Salle(salle);
	}

	const creneau = new Creneau(type, parseInt(capa), index, jour, heureDeb, minDeb, heureFin, minFin);

	this.mapSalles[salle].addCreneau(creneau);
	creneau.room = this.mapSalles[salle];

	return creneau;

}
CRUParser.prototype.creneauSup = function (input, lastCreneau) {
	const [jour, [heureDeb, minDeb], [heureFin, minFin]] = this.horaireSup(input) ?? [];
	const type = this.type(input);
	const salle = this.salle(input);
	if (!type || !jour || !salle) {
		this.errMsg("Invalid creneau format.", input);
		return false;
	}

	// Check si la salle est déjà register, sinon on la crée
	if (!this.mapSalles[salle]) {
		this.mapSalles[salle] = new Salle(salle);
	}

	const creneau = new Creneau(type, lastCreneau.nbStudents, lastCreneau.index, jour, heureDeb, minDeb, heureFin, minFin);
	this.mapSalles[salle].addCreneau(creneau);
	creneau.room = this.mapSalles[salle];

	return creneau;
}

// <Type> = 1UPPERALPHA 1DIGIT
CRUParser.prototype.type = function (input) {
	this.expect(",", input);
	let curS = this.next(input);
	const matched = curS.match(/^[A-Z]+(\d)+$/);
	if (matched) {
		return matched[0];
	} else {
		this.errMsg("Invalid type : ", curS, " please enter a valid, or verify the given document.");
		return false
	}
}

// <Capacité> = ‘P=’ 1*DIGIT
CRUParser.prototype.capa = function (input) {
	this.next(input); //saut de la ,
	if (!this.expect("P=", input)) {
		this.errMsg("Wrong class format.");
		return false;
	}
	let curS = this.next(input);
	const matched = curS.match(/^\d+$/)
	if (matched) {
		return matched[0];
	} else {
		this.errMsg("Invalid capacity : ", curS, " please enter a valid, or verify the given document.");
		return false
	}
}

// <Index> = 1UPPERALPHA 1DIGIT
CRUParser.prototype.index = function (input) {
	this.next(input);
	let curS = this.next(input);
	const matched = curS.match(/^[A-Z]{1,2}(\d)?$/);
	if (matched) {
		return matched[0];
	} else {
		this.errMsg("Invalid index : ", curS, " please enter a valid, or verify the given document.");
		return false
	}
}

// <Salle> = ‘S=’ 4(UPPERALPHA / DIGIT)
CRUParser.prototype.salle = function (input) {
	this.next(input)
	if (!this.expect("S=", input)) {
		this.errMsg("Wrong class format.")
		return false;
	}
	let curS = this.next(input)
	const matched = curS.match(/^[A-Z]+\d+$/);
	if (matched) {
		return matched[0];
	} else {
		this.errMsg("Invalid salle : ", curS, " please enter a valid, or verify the given document.");
		return false
	}

}

CRUParser.prototype.getHoraire = function (input) {
	let horaire_h = this.next(input);
	this.expect(":", input);
	let horaire_min = this.next(input);
	return [parseInt(horaire_h), parseInt(horaire_min)];
}

// <Horaire> = ‘H=’ <Jour> WSD <Heure> ‘-’ <Heure>
CRUParser.prototype.horaire = function (input) {
	this.next(input);//jet de la ","
	this.expect("H=", input);
	let jour = this.next(input)
	let horaire_deb = this.getHoraire(input);
	this.expect("-", input);
	let horaire_end = this.getHoraire(input);
	return [jour, horaire_deb, horaire_end];
}
CRUParser.prototype.horaireSup = function (input) {
	let jour = this.next(input);
	let horaireDeb = this.getHoraire(input)
	this.expect("-", input)
	let horaireFin = this.getHoraire(input)
	return [jour, horaireDeb, horaireFin]
}







CRUParser.prototype.errMsg = function (msg, input) {
	this.errorCount++;
	console.log("Parsing Error ! on " + input + " -- msg : " + msg);
}

// Read and return a symbol from input
CRUParser.prototype.next = function (input) {
	var curS = input.shift();
	if (this.showParsedSymbols) {
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
CRUParser.prototype.accept = function (s) {
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if (idx === -1) {
		this.errMsg("symbol " + s + " unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
CRUParser.prototype.check = function (s, input) {
	if (this.accept(input[0]) == this.accept(s)) {
		return true;
	}
	return false;
}
CRUParser.prototype.checkSTR = function (s, input) {
	if (input[0] === s) {
		return true;
	}
}

// expect : expect the next symbol to be s.
CRUParser.prototype.expect = function (s, input) {
	let val = this.next(input);
	if (s === val) {
		//console.log("Reckognized! "+s)
		return true;
	} else {
		this.errMsg("symbol " + s + " doesn't match", input);
	}
	return false;
}


// Parser rules

// <liste_poi> = *(<poi>) "$$"
CRUParser.prototype.listPoi = function (input) {
	this.poi(input);
	this.expect("$$", input);
}

// <poi> = "START_POI" <eol> <body> "END_POI"
CRUParser.prototype.poi = function (input) {

	if (this.check("START_POI", input)) {
		this.expect("START_POI", input);
		var args = this.body(input);
		var p = new POI(args.nm, args.lt, args.lg, []);
		this.note(input, p);
		this.expect("END_POI", input);
		this.parsedPOI.push(p);
		if (input.length > 0) {
			this.poi(input);
		}
		return true;
	} else {
		return false;
	}

}

// <body> = <name> <eol> <latlng> <eol> <optional>
CRUParser.prototype.body = function (input) {
	var nm = this.name(input);
	var ltlg = this.latlng(input);
	return { nm: nm, lt: ltlg.lat, lg: ltlg.lng };
}

// <name> = "name: " 1*WCHAR
CRUParser.prototype.name = function (input) {
	this.expect("name", input)
	var curS = this.next(input);
	if (matched = curS.match(/[\wàéèêîù'\s]+/i)) {
		return matched[0];
	} else {
		this.errMsg("Invalid name", input);
	}
}

// <latlng> = "latlng: " ?"-" 1*3DIGIT "." 1*DIGIT", " ?"-" 1*3DIGIT "." 1*DIGIT
CRUParser.prototype.latlng = function (input) {
	this.expect("latlng", input)
	var curS = this.next(input);
	if (matched = curS.match(/(-?\d+(\.\d+)?);(-?\d+(\.\d+)?)/)) {
		return { lat: matched[1], lng: matched[3] };
	} else {
		this.errMsg("Invalid latlng", input);
	}
}

// <optional> = *(<note>)
// <note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
CRUParser.prototype.note = function (input, curPoi) {
	if (this.check("note", input)) {
		this.expect("note", input);
		var curS = this.next(input);
		if (matched = curS.match(/[12345]/)) {
			curPoi.addRating(matched[0]);
			if (input.length > 0) {
				this.note(input, curPoi);
			}
		} else {
			this.errMsg("Invalid note");
		}
	}
}

module.exports = CRUParser;