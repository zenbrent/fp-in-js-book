var chai = require("chai");
var L = require("lodash");
var U = require("underscore");

var flow = require("../src/flow");

chai.use(require("chai-things"));
var { expect } = chai;

describe("flow control", () => {
    it("should allow basic chaining", () => {
        var person = flow.createPerson();
        person
        .setFirstName("brent")
        .setLastName("brimhall")
        .setAge(29)
        expect(person.toString()).to.equal("brimhall, brent is 29 years old.")
    });

    describe("_.chain, _.tap, _.value", () => {
        var library = [
            { title: "SICP", isbn: "0262010771", ed: 1 },
            { title: "SICP", isbn: "0262510871", ed: 2 },
            { title: "Joy of Clojure", isbn: "1935182641", ed: 1 }
        ];

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
});

