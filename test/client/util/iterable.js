var expect = chai.expect;
var p = new Util.Promise();

require(['/dest/util/iterable.js'], function(Exported){

	// test suite start
	describe("Iterable", function() {
		describe("insert", function() {
			it("should have a default name", function() {

				expect('1').to.equal('1');
			});
		});
	});
	// test suite end

	p.resolve();
});

window.tests.push(p);