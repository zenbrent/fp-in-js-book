// chapter 9 -- the end!
// Programming Without Class

var _ = require("lodash");

var all = require("../src/all_fns");
var flow = require("../src/flow");
var fns = require("../src/fns");
var {expect} = require("./fixtures/chai");
var classless = require('../src/no_class');

describe("classless programming", () => {
    describe("classless lazy chain", () => {
        var {lazyChain} = classless;

        it("should work like LazyChain", () => {
            var lazyOp = lazyChain([2,1,3])
            .invoke('concat', [7,7, null, 9])
            .invoke('sort');

            expect(lazyOp.force()).to.deep.equal(
                [1, 2, 3, 7, 7, 9, null]
            );
        });

        // Lift sort to a lazy sort
        var deferredSort = (ary) => lazyChain(ary).invoke('sort');

        // because we're factoring to functions...
        var force = (thunk) => thunk.force();

        it("should lift any operation", () => {
            var deferredSorts = _.map(
                [[2, 3, 1], [1, 9, 8], [0, 1, 5]],
                deferredSort
            );

            var reifiedSorts = _.map(deferredSorts, force);

            expect(reifiedSorts).to.deep.equal(
                [[1, 2, 3], [1, 8, 9], [0, 1, 5]]
            );
        });

        var validateTriples = fns.validator(
            "Each array should have three elements",
            (arrays) => _.every(arrays, (a) => a.length === 3)
        );

        var validateTripleStore = all.partial1(
            all.condition1(validateTriples),
            _.identity
        );

        it("testing the triple store validator", () => {
            try {
                validateTripleStore([[2,1,3], [7,7,1], [0,9,5]]);
            } catch (ex) {
                expect.fail();
            }

            try {
                validateTripleStore([[1,3], [7,7,1], [0,9,5]]);
                expect.fail();
            } catch (ex) {
                expect(ex.toString()).to.equal("Error: Each array should have three elements")
            }
        });

        // Non-lazy step:
        var postProcess = (arrays) => _.map(arrays, all.second);

        it("should compose a ton of stuff", () => {
            // Parse a string representing a 2d array
            // validate that each one has 3 elements
            // sort them and grab the 2nd element
            // sort that and stringify it.
            function processTriples(data) {
                return flow.pipeline(
                    data,
                    JSON.parse,
                    validateTripleStore,
                    deferredSort,
                    force,
                    postProcess,
                    fns.invoker('sort', Array.prototype.sort),
                    JSON.stringify);
            }

            expect(processTriples("[[2,1,3], [7,7,1], [0,9,5]]"))
            .to.equal("[1,7,9]");

            /* So, for example, you could do this:
                $.get(
                    "http://djhkjhkdj.com",
                    (data) => $("#result").text(processTriples(data))
                )
            // or even better:
                var reportDataPackets = _.compose(
                    (s) => $("#result").text(s),
                    processTriples
                );
                $.get("http://djhkjhkdj.com", reportDataPackets);
            */

           // Incompatible data pipelines can be connected via adapters.
        });
    });
});
