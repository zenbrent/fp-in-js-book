var chai = require("chai");
var L = require("lodash");
var U = require("underscore");

var flow = require("../src/flow");
var fns = require("../src/all_fns");

chai.use(require("chai-things"));
var { expect } = chai;

describe("flow control", () => {
    var library = [
        { title: "SICP", isbn: "0262010771", ed: 1 },
        { title: "SICP", isbn: "0262510871", ed: 2 },
        { title: "Joy of Clojure", isbn: "1935182641", ed: 1 }
    ];

    it("should allow basic chaining", () => {
        var person = flow.createPerson();
        person
        .setFirstName("brent")
        .setLastName("brimhall")
        .setAge(29)
        expect(person.toString()).to.equal("brimhall, brent is 29 years old.")
    });

    describe("_.chain, _.tap, _.value", () => {
        it("should chain shiz together and get intermediary values", () => {
            var books = L.chain(library)
            .pluck("title")
            .tap((booksInProgress) => {
                expect(booksInProgress)
                .to.deep.equal(["SICP", "SICP", "Joy of Clojure"]);
            })
            .sort()
            .value()

            expect(books)
            .to.deep.equal(["Joy of Clojure", "SICP", 'SICP']);
        });
    });

    describe("lazy chains", () => {
        describe("lodash vs underscore", () => {
            var tappedVal = null;
            beforeEach(() => tappedVal = null)

            it("shows that underscore is isn't lazy", () => {
                U([2,1,3]).chain().sort().tap((v) => tappedVal = v);
                expect(tappedVal).to.not.be.null;
            });

            it("shows that lodash is lazy", () => {
                L([2,1,3]).chain().sort().tap((v) => tappedVal = v);
                expect(tappedVal).to.be.null;
            });

            it("shows that lodash is lazy", () => {
                var actualVal = L([2,1,3]).chain().sort().tap((v) => tappedVal = v).value();
                expect(tappedVal)
                .to.equal(actualVal)
                .and.to.deep.equal([1,2,3]);
            });
        });

        describe("my LazyChain", () => {
            var {LazyChain} = flow;

            it("should lazy chain things together", () => {
                var tappedVal = null;
                var chain = new LazyChain([2,1,3])
                .invoke('concat', [9,8,7])
                .invoke('sort')
                .tap((v) => tappedVal = v)
                .invoke('map', (v) => v * 2)

                expect(tappedVal).to.be.null;

                var value = chain.force();
                expect(tappedVal).to.deep.equal([1, 2, 3, 7, 8, 9]);
                expect(value).to.deep.equal([2, 4, 6, 14, 16, 18]);
            });

            it("should take another chain in the ctor", () => {
                var tappedVal1 = null;
                var tappedVal2 = null;

                var chain = new LazyChain([2, 1, 3])
                .invoke("map", (v) => v * 2)
                .tap((v) => tappedVal1 = v)
                .invoke('sort');

                var chain2 = new LazyChain(chain)
                .invoke('concat', [9, 8, 7])
                .tap((v) => tappedVal2 = v);

                expect(tappedVal1).to.equal(tappedVal2).to.equal(null);
                chain.force();
                expect(tappedVal1).to.deep.equal([2, 4, 6]);
                expect(tappedVal2).to.equal(null);

                tappedVal1 = tappedVal2 = null;
                chain2.force();
                expect(tappedVal1).to.deep.equal([2, 4, 6]);
                expect(tappedVal2).to.deep.equal([2, 4, 6, 9, 8, 7]);
            });
        });
    });

    describe("pipelines", () => {
        var {pipeline} = flow;

        it("should give null with no value", () => {
            expect(pipeline()).to.be.undefined;
        });

        it("should give return a value when no fns are passed", () => {
            expect(pipeline(123)).to.equal(123);
        });

        function fifth(a) {
            return pipeline(a, U.rest, U.rest, U.rest, U.rest, U.first);
        }

        it("should chain functions", () => {
            var list = ["a", "b", "c", "d", "e", "f", "g"];
            expect(fifth(list)).to.equal("e");
        });

        function negativeFifth(a) {
            return pipeline(a, fifth, (n) => -n);
        }

        it("should chain pipelines", () => {
            var list = [1, 2, 3, 4, 5, 6, 7];
            expect(negativeFifth(list)).to.equal(-5);
        });

        describe("with relational fns", () => {
            var relational = require('../src/sqlish-fns');
            var {RQL} = flow;

            it("should chain together", () => {
                var {as, project, restrict} = relational;

                function firstEditions(table) {
                    return pipeline(table,
                        (t) => as(t, {ed: 'edition'}),
                        (t) => project(t, ['title', 'edition', 'isbn']),
                        (t) => restrict(t, (book) => book.edition === 1)
                    );
                }

                expect(firstEditions(library))
                .to.deep.equal([
                    { title: "SICP", isbn: "0262010771", edition: 1 },
                    { title: "Joy of Clojure", isbn: "1935182641", edition: 1 }
                ]);
            });

            it("should chain together nicer after curry", () => {
                var {RQL} = flow;

                function firstEditions(table) {
                    return pipeline(table,
                        RQL.as({ed: 'edition'}),
                        RQL.project(['title', 'edition', 'isbn']),
                        RQL.restrict((book) => book.edition === 1)
                    );
                }

                expect(firstEditions(library))
                .to.deep.equal([
                    { title: "SICP", isbn: "0262010771", edition: 1 },
                    { title: "Joy of Clojure", isbn: "1935182641", edition: 1 }
                ]);
            });
        });
    });

    describe("monads!", () => {
        // A testable alternative to log:
        function log(/* vals */) {
            log.values.push(U.toArray(arguments).join(" "));
        }
        log.reset = function() {
            log.values = [];
        }

        function sqr(n) {
            return Math.pow(n, 2);
        }

        function note(state) {
            log("NOTE: " + state);
        }

        beforeEach(() => log.reset());

        describe("A first attempt", () => {
            var {actions} = flow;

            var mFns = {
                mSqr() {
                    return function(state) {
                        var answer = sqr(state, 2);
                        return {answer, state: answer};
                    }
                },

                mNote(arr) {
                    return function(state) {
                        log("NOTE: " + state);
                        return {answer: undefined, state};
                    };
                },

                mNeg() {
                    return (state) => ({answer: -state, state: -state});
                }
            };

            it("can connect squaring fns", () => {
                var doubleSquareAction = actions(
                    [mFns.mSqr(), mFns.mSqr()],
                    (values) => values
                );

                expect(doubleSquareAction(10)).to.deep.equal([100, 10000]);
            });

            it("can combine different functions", () => {

                var negativeSqrFn = actions(
                    [mFns.mSqr(), mFns.mNote(), mFns.mNeg()],
                    (_, state) => state
                );

                expect(negativeSqrFn(10)).to.equal(-100);
                expect(log.values).to.deep.equal(["NOTE: 100"]);
            });
        });

        describe("Lifting functions for brevity", () => {
            var {actions, lift} = flow;

            var mFns = {
                mSqr: lift(sqr),
                mNote: lift(note, U.identity),
                mNeg: lift((n) => -n)
            };

            it("can combine different fns more simply", () => {
                var negativeSqrFn = actions(
                    [mFns.mSqr(), mFns.mNote(), mFns.mNeg()],
                    (U, state) => state
                );

                expect(negativeSqrFn(10)).to.equal(-100);
                expect(log.values).to.deep.equal(["NOTE: 100"]);
            });
        });

        describe("Stack actions using lift", () => {
            var {pipeline, actions, lift} = flow;

            var push = lift((stack, e) => fns.construct(e, stack));
            var pop = lift(U.first, U.rest);

            var stackAction = actions(
                [push(1), push(2), pop()],
                (values, state) => values
            );

            it("should do actions", () => {
                var result = [];

                pipeline(
                    [],
                    stackAction,
                    U.chain
                ).each((elem) => result.push(elem));

                expect(result).to.deep.equal([[1], [2, 1], 2]);
            });
        });
    });
});

