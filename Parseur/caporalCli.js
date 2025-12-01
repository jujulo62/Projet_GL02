const fs = require('fs');
const colors = require('colors');
const CRUParser = require('./CRUParser.js');

// Import de l'analyzer global et des fonctions depuis fonction.js
const {capaciteSalle, sallesCours, genererIcal, analyzer} = require('../fonction/fonction.js'); 

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;
cli
	.version('vpf-parser-cli')
	.version('0.07')	// check Vpf
	.command('check', 'Check if <file> is a valid Vpf file')
	.argument('<file>', 'The file to check with Vpf parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	  
			// Crée une instance locale pour le check/affichage, qui ne doit PAS être l'analyzer global
			var localAnalyzer = new CRUParser(options.showTokenize, options.showSymbols); 
			localAnalyzer.parse(data);
			
			if(localAnalyzer.errorCount === 0 && Object.keys(localAnalyzer.parsedCRU).length > 0){
				logger.info("The .cru file is a valid cru file".green);
			}else{
				logger.info("The .cru file contains error , contains no UE or is in the wrong format".red);
			}
			
			logger.debug(localAnalyzer.parsedPOI);

		});
			
	})


	.command('printTokens','Prints the tokenized input file')
	.argument('<file>', 'The file to print tokens from')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}
			var analyzer = new CRUParser();
			analyzer.dataPrinter(data);
		});
	})
	
	// Nouvelle commande : icalendar (SPEC_FONC_5)
	.command('icalendar', 'Génère un fichier iCalendar pour les UEs entre 2 dates.')
	.argument('<file>', 'Le fichier CRU à parser.')
	.argument('<startDate>', 'Date de début de la période (YYYY-MM-DD).')
	.argument('<endDate>', 'Date de fin de la période (YYYY-MM-DD).')
	.argument('<ues...>', 'Liste des UEs à inclure, séparées par des espaces (ex: LE01 MT03).')
	.action(({args, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}
			
			// *** CORRECTION ICI : Utiliser l'analyzer GLOBAL importé ***
			analyzer.parse(data); 
			
			if (analyzer.errorCount === 0 && Object.keys(analyzer.parsedCRU).length > 0) {
				// L'analyzer GLOBAL est maintenant peuplé, genererIcal peut travailler
				genererIcal(args.startDate, args.endDate, args.ues);
			} else {
				logger.info("Impossible de parser le fichier CRU pour l'export iCalendar.".red);
			}
		});
	})
	// search
	.command('search', 'Free text search on POIs\' name')
	.argument('<file>', 'The Vpf file to search')
	.argument('<needle>', 'The text to look for in POI\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){
		
			// Filtre à ajouter //
			let poiAFiltrer = analyzer.parsedPOI;
			logger.info("%s", JSON.stringify(poiAFiltrer, null, 2));
			// Filtre à ajouter //
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})

	// average
	//.command('average', 'Compute the average note of each POI')
	//.alias('avg')

	// abc
	.command('abc', 'Compute the average note of each POI and export a CSV file')
	.action(({args, options, logger}) => {
		logger.info("abc");
		logger.warn('Test d"erreur')
	})
	// average with chart
	.command('averageChart', 'Compute the average note of each POI and export a Vega-lite chart')
	.alias('avgChart')
	.argument('<file>', 'The Vpf file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			// ToDo: Prepare the data for avg //
			// let avg = <un array de POI ayant un attribut "averageRatings" égal à la moyenne des notes qu'il a reçu>
			
			var avgChart = {
				//"width": 320,
				//"height": 460,
				"data" : {
						"values" : avg
				},
				"mark" : "bar",
				"encoding" : {
					"x" : {"field" : "name", "type" : "nominal",
							"axis" : {"title" : "Restaurants' name."}
						},
					"y" : {"field" : "averageRatings", "type" : "quantitative",
							"axis" : {"title" : "Average ratings for "+args.file+"."}
						}
				}
			}
			
			
			
			const myChart = vegalite.compile(avgChart).spec;
			
 
			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result.svg", res)
				view.finalize();
				logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result.svg");
			});
			
			/* Canvas version */
			/*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
			
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})	

	
cli.run(process.argv.slice(2));