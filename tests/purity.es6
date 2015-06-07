// Chapter 7

var _ = require('lodash');

var fns = require('../src/all_fns');
var pure = require('../src/purity');
var {expect} = require("./fixtures/chai");

describe('functional purity', () => {
    describe('seperating pure from impure with random generators', () => {
        var  {generateRandomCharacter, generateString} = pure;
        it('will make a random character generator', () => {
            var randString = generateString(generateRandomCharacter, 10);
            expect(randString).to.have.length(10);
        });

        it('is also testable!', () => {
            // even though the random number gen isn't pure, this part is:
            var randString = generateString(fns.always('a'), 10);
            expect(randString).to.equal('aaaaaaaaaa');
        });
    });

    describe('immutability', () => {
        describe('freezing', () => {
            // N.B.: freezing arbitrary objects might introduce subtle bugs when interacting with third-party APIs
            it('will cause mutations to fail', () => {
                var a = [1,2,3];
                Object.freeze(a);
                var ex;
                try {
                    a[2] = 4;
                } catch (x) {
                    ex = x;
                }
                expect(ex).to.be.instanceOf(Error);
            });

            it("isn't deep though", () => {
                var a = [1,{a: 'asdf'},3];
                Object.freeze(a);
                var ex;
                try {
                    a[1].a = 4;
                } catch (x) {
                    ex = x;
                }
                expect(ex).to.be.undefined;
            });

            var {deepFreeze} = pure;
            it("ergo deep freeze", () => {
                var a = [1,{a: 'asdf'},3];
                deepFreeze(a);
                var ex;
                try {
                    a[1].a = 4;
                } catch (x) {
                    ex = x;
                }
                expect(ex).to.be.instanceOf(Error);
            });
        });

        describe('merging', () => {
            it('when _.extend mutates', () => {
                var a = {a: 0};
                _.extend(a, {b: 1});
                expect(a).to.deep.equal({a:0, b: 1});
            });

            var {merge} = pure;
            it("merge doesn't mutate!", () => {
                var a = {a: 0};
                var b = merge(a, {b: 1});

                expect(a).to.deep.equal({a:0});
                expect(b).to.deep.equal({a:0, b: 1});
            });
        });

        describe('immuable objects', () => {
            function Point(x, y) {
                this._x = x;
                this._y = y;
            }
            Point.prototype = {
                withX (val) {
                    return new Point(val, this._y);
                },
                withY (val) {
                    return new Point(this._x, val);
                }
            };

            it("shouldn't mutate when changing it", () => {
                var pt1 = new Point(0, 1);
                var pt2 = pt1.withX(100).withY(-100);

                expect(pt1._x).to.equal(0);
                expect(pt2._x).to.equal(100);

                expect(pt1._y).to.equal(1);
                expect(pt2._y).to.equal(-100);
            });
        });

        describe('immuable objects without constructors', () => {
            // This is similar to what's described on p159 -
            // creating functions to handle the data, making the data structures
            // unimportant.
            //
            // Benifits of this approach:
            //= I do not need to worry as much about the actual types.
            //= I can return types appropriate for certain use cases. For example, small arrays are quite fast at modeling small maps, but as maps grow, an object may be more appropriate. This change-over can occur transparently based on programmatic use.
            //= If the type or methods change, then I need only to change the functions and not every point of use.
            //= I can add pre- and postconditions on the functions if I choose.
            //= The functions are composable.

            var Point = {
                x: 0, y: 0,

                create (x, y) {
                    var newPoint = Object.create(Point);
                    newPoint.x = x;
                    newPoint.y = y;
                    return newPoint;
                },

                withX (p, val) {
                    var newPoint = Object.create(p);
                    newPoint.x = val;
                    return newPoint;
                },

                withY (p, val) {
                    var newPoint = Object.create(p);
                    newPoint.y = val;
                    return newPoint;
                }
            }

            it("shouldn't mutate when changing it", () => {
                var pt1 = Point.create(0, 1);
                var pt2 = Point.withY(Point.withX(pt1, 100), -100);

                expect(pt1.x).to.equal(0);
                expect(pt2.x).to.equal(100);

                expect(pt1.y).to.equal(1);
                expect(pt2.y).to.equal(-100);
            });
        });
    });
});

