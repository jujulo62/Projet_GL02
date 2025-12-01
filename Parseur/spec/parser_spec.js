const CRUParser = require('../CRUParser');
const Creneau = require('../Creneau');

describe("Program testing of Creneau", function(){
	
	beforeAll(function() {

		this.c = new Creneau("D1", 25, "V", [ "9", "00"], [ "12", "00"], "F1", "B103");
        this.parser = new CRUParser(false, false)


	});
	it("peut créer un nv Creneau", function(){
        let inputString = "1,D1,P=25,H=V 9:00-12:00,F1,S=B103//";
        let tokensCreneau = this.parser.tokenize(inputString);
        // Pour enlever le "1" au début
        tokensCreneau.shift(); 
		expect(this.c).toBeDefined();
		expect(this.parser.creneau(tokensCreneau)).toEqual(this.c);
        
	});
	it("peut trouver le type", function(){
		
		expect(this.c).toBeDefined();
		expect(this.c.type).toBe("D1");
		expect(this.c).toEqual(jasmine.objectContaining({type: "D1"}));
		
	});
	it("peut parser un nom d'UE", function(){
        let inputStringUE = "+AP1B"; 
        let tokensUE = this.parser.tokenize(inputStringUE);
        this.parser.expect("+", tokensUE); 
        const ueName = this.parser.ue(tokensUE);
        expect(ueName).toBe("AP1B");
    });
	it("peut reconnaître le UVUV de début de fichier", function(){
        let inputStringUE = "+UVUV"; 
        let tokensUE = this.parser.tokenize(inputStringUE);
        this.parser.expect("+", tokensUE); 
        const ueName = this.parser.ue(tokensUE);
        expect(ueName).toBe("UE_TEST");
    });
	

	
});