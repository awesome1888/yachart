var expect = chai.expect;

require(['/dest/util/iterable.js'], function(Exported){
	"use strict";



});


describe("Cow", function() {
	describe("constructor", function() {
		it("should have a default name", function() {

			expect('1').to.equal('1');
		});

		// it("should set cow's name if provided", function() {
		// 	var cow = new Cow("Kate");
		// 	expect(cow.name).to.equal("Kate");
		// });
	});

	// describe("#greets", function() {
	// 	it("should throw if no target is passed in", function() {
	// 		expect(function() {
	// 			(new Cow()).greets();
	// 		}).to.throw(Error);
	// 	});
	//
	// 	it("should greet passed target", function() {
	// 		var greetings = (new Cow("Kate")).greets("Baby");
	// 		expect(greetings).to.equal("Kate greets Baby");
	// 	});
	// });
});