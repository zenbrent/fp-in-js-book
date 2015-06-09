// chapter 9 part 2 -- the very end!
// Programming Without Class
// Sometimes classes are nice.

var _ = require("lodash");
var {dispatch, always, isEven, construct} = require("../src/all_fns");
var {Container} = require("../src/container");

var {expect} = require("./fixtures/chai");

// var all = require("../src/all_fns");
// var flow = require("../src/flow");
// var fns = require("../src/fns");
// var classless = require('../src/no_class');
var mixins = require('../src/mixins');

describe("mixins", () => {
    describe("example functions", () => {
        var {polyToStringFn, polyToStringDspch} = mixins;

        it("should stringify an object & array", () => {
            expect(polyToStringFn([1,2,3]))
            .to.equal("[1,2,3]");

            expect(polyToStringFn([1,2,[3,4]]))
            .to.equal("[1,2,[3,4]]");
        });

        it("should stringify an object & array", () => {
            expect(polyToStringDspch([1,2,3])).to.equal("[1,2,3]");
            expect(polyToStringDspch([1,2,[3,4]])).to.equal("[1,2,[3,4]]");

            expect(polyToStringDspch(new Container(_.range(5))))
            .to.equal("{\"_value\":[0,1,2,3,4]}");

            var polyToStringD2 = dispatch(
                (s) => ["@", polyToStringDspch(s._value)].join(''),
                polyToStringDspch
            );

            expect(polyToStringD2(new Container(_.range(5))))
            .to.equal("@[0,1,2,3,4]");
        });

        var {HierarchicalCASClass} = mixins;

        it("use the kinda nifty compare & swap", () => {
            var c = new HierarchicalCASClass(42);

            // NOTE: notifying observers
            c.swap(42, 43);
            // // NOTE: notifying observers //=> 43

            try {
                c.swap('not the value', 44);
                expect.fail();
            } catch (ex) {
                expect(ex.toString()).to.equal("Error: No match");
            }
        });
    });

    describe("making objects made with mixins", () => {
        var {HoleMixin, ValidateMixin, ObserverMixin, SwapMixin, SnapshotMixin} = mixins;

        // The need for the init method is derived from the direct use of Container in the con‐ structor.
        function Hole1(val) {
            Container.call(this, val);
        }

        // Do the mixin!
        _.extend(
            Hole1.prototype,
            HoleMixin,
            ValidateMixin,
            ObserverMixin
        );


        it("should make a Hole1", () => {
            var h = new Hole1(42);
            h.addValidator(isEven);

            h.setValue(8);
            expect(h.getValue()).to.equal(8);

            try {
                h.setValue(9);
                expect.fail();
            } catch (ex) {
                expect(ex.message).to.equal("Attempted to set invalid value 9");
            }

            expect(h.getValue()).to.equal(8);
        });

        it("should make an even Hole1", () => {
            var h = new Hole1(42);
            h.addValidator(isEven);

            try {
                h.setValue(9);
                expect.fail();
            } catch (ex) {
                expect(ex.message).to.equal("Attempted to set invalid value 9");
            }
        });

        it("can actually be tested w/o instantiating objects", () => {
            // object mockup
            var o = {
                _value: 0,
                setValue: _.identity
            };
            _.extend(o, SwapMixin);
            var result = o.swap(construct, [1,2,3]);

            expect(result).to.deep.equal([0, 1, 2, 3]);
        });


        function Hole2(val) {
            Container.call(this, val);
        }

        // Do the mixin!
        _.extend(
            Hole2.prototype,
            HoleMixin,
            ValidateMixin,
            ObserverMixin,
            SwapMixin,
            SnapshotMixin
        );

        it("can do tons of shiz", () => {
            var h = new Hole2(42);
            expect(h.snapshot()).to.equal(42);
            expect(h.swap(always(99))).to.equal(99);
            expect(h.snapshot()).to.equal(99);

            var h2 = new Hole2({someValue: 42});
            expect(h2.snapshot()).to.deep.equal({someValue: 42});
            var obj = {someValue: 99};
            expect(h2.swap(always(obj))).to.deep.equal({someValue: 99});
            expect(h2.snapshot()).to.deep.equal({someValue: 99});
            expect(h2.snapshot()).to.not.equal(obj);
        });

    });

});
