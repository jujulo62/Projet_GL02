const fs = require('fs');
const colors = require('colors');
const CRUParser = require('./CRUParser.js');

const {capaciteSalle, sallesCours, disponibilitesSalle, verifierRecouvrements, sallesDisponibles} = require('../fonction/fonction.js');

const vg = require('vega');
const vegalite = require('vega-lite');
const Creneau = require('./Creneau.js');

const cli = require("@caporal/core").default;
cli
	.version('cru-parser-cli')
	.version('0.07')	// check CRU
	.command('check', 'Check if <file> is a valid CRU file')
	.argument('<file>', 'The file to check with CRU parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	  
			var analyzer = new CRUParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0 && Object.keys(analyzer.parsedCRU).length > 0){
				logger.info("The .cru file is a valid cru file".green);
			}else{
				logger.info("The .cru file contains error, contains no UE or is in the wrong format".red);
			}
			
			logger.debug(analyzer.parsedPOI);

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

	.command('capaciteMax','Get the maximum capacity for a given room')
	.argument('<file>', 'The file to check with Vpf parser')
	.argument('<roomId>', 'The room id to get the maximum capacity from')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}
			var analyzer = new CRUParser(false, false);
			analyzer.parse(data);
			capaciteSalle(analyzer, args.roomId);
		});
	})

	.command('sallesCours','Get the rooms for a given course')
	.argument('<file>', 'The file to check with Vpf parser')
	.argument('<courseId>', 'The course id to get the rooms from')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}
			var analyzer = new CRUParser(false, false);
			analyzer.parse(data);
			sallesCours(analyzer, args.courseId);
		});
	})

	.command('dispoSalle','Get the availability of a given room')
	.argument('<file>', 'The file to check with Vpf parser')
	.argument('<roomId>', 'The room id to get the availability from')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}
			var analyzer = new CRUParser(false, false);
			analyzer.parse(data);
			disponibilitesSalle(analyzer, args.roomId);
		});
	})

	.command('qualiteData','Get the data quality of a given file')
	.argument('<file>', 'The file to get the data quality from')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}
			var analyzer = new CRUParser(false, false);
			analyzer.parse(data);
			verifierRecouvrements(analyzer);
		});
	})

	.command('sallesDispo', 'Get the available rooms for a given time')
	.argument('<file>', 'The file to check with Vpf parser')
	.argument('<day>', 'Day of the week (L, MA, ME, J, V, S, D)')
	.argument('<startTime>', 'Start time in HH:MM format')
	.argument('<endTime>', 'End time in HH:MM format')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data){
			if (err){
				return logger.warn(err);
			}

			// Validation des arguments jour et heures
			if (Creneau.jours.indexOf(args.day) === -1) {
				return logger.warn("Invalid day argument");
			}

			// Validation des arguments heureDebut et heureFin
			const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
			if (!timeRegex.test(args.startTime) || !timeRegex.test(args.endTime)) {
				return logger.warn("Invalid time format. Please use HH:MM format.");
			}

			var analyzer = new CRUParser(false, false);
			analyzer.parse(data);
			sallesDisponibles(analyzer, args.day, args.startTime, args.endTime);
		});
	})

	// readme
	//.command('readme', 'Display the README.txt file')
	//.action(({args, options, logger}) =>
	//  ...
	//})
	
	
		

	
cli.run(process.argv.slice(2));
	