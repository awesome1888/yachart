var expect = chai.expect;
var p = new Util.Promise();

/**
 * @see http://chaijs.com/api/bdd/
 */
require(['/dest/util/ordereddictionary.js'], function(Exported){

	let helperItemIs = function(item, pair)
	{
		expect(item).to.be.an('object');
		expect(item.order).to.equal(pair[0]);
		expect(item.instance).to.equal(pair[1]);
	};

	describe("OrderedDictionary", function() {

		let iterable = new Exported.OrderedDictionary();

		describe("insert", function() {
			it("should insert the first one", function() {

				iterable.insertByOrder(10, 20);
				expect(iterable.count).to.equal(1);

				helperItemIs(iterable.nth(0), [10, 20]);
			});
			it("should insert another at the end", function(){

				iterable.insertByOrder(20, 30);
				expect(iterable.count).to.equal(2);

				helperItemIs(iterable.last, [20, 30]);
			});
			it("should insert another at the beginning", function(){

				iterable.insertByOrder(5, 50);
				expect(iterable.count).to.equal(3);

				helperItemIs(iterable.first, [5, 50]);
			});
			it("should insert another between the first two", function(){

				iterable.insertByOrder(15, 10);
				expect(iterable.count).to.equal(4);

				helperItemIs(iterable.nth(2), [15, 10]);
			});
			it("should replace the existing", function(){

				iterable.insertByOrder(10, 100);
				expect(iterable.count).to.equal(4);

				helperItemIs(iterable.nth(1), [10, 100]);
			});
			it("should delete from the middle", function(){

				iterable.deleteByOrder(10);
				expect(iterable.count).to.equal(3);

				helperItemIs(iterable.nth(0), [5, 50]);
				helperItemIs(iterable.nth(1), [15, 10]);
			});
			it("should delete from the beginning", function(){

				iterable.deleteByOrder(5);
				expect(iterable.count).to.equal(2);

				helperItemIs(iterable.first, [15, 10]);
			});
			it("should delete from the end", function(){

				iterable.deleteByOrder(20);
				expect(iterable.count).to.equal(1);

				helperItemIs(iterable.first, [15, 10]);
			});
		});
	});
	// test suite end

	p.resolve();
});

window.tests.push(p);