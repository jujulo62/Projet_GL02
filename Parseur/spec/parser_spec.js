const CRUParser = require('../CRUParser');
const Creneau = require('../Creneau');

describe("Program testing of Creneau", function(){
	
	beforeAll(function() {

		this.c = new Creneau("D1", 25, "V", [ "9", "00"], [ "12", "00"], "F1", "B103");
        this.parser = new CRUParser(false, false)


	});
	it("can create a new Creneau", function(){
        let inputString = "1,D1,P=25,H=V 9:00-12:00,F1,S=B103//";
        let tokensCreneau = this.parser.tokenize(inputString);
        // Pour enlever le "1" au début
        tokensCreneau.shift(); 
		expect(this.c).toBeDefined();
		expect(this.parser.creneau(tokensCreneau)).toEqual(this.c);
        
	});
	it("can find the type", function(){
		
		expect(this.c).toBeDefined();
		expect(this.c.type).toBe("D1");
		expect(this.c).toEqual(jasmine.objectContaining({type: "D1"}));
		
	});
	
	

	
});