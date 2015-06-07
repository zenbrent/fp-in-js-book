var fns = require('../src/all_fns');
var {Container, ImmutableContainer} = require('../src/container');
var {expect} = require("./fixtures/chai");

describe('isolating change with a container object', () => {
    it('should create a value', () => {
        var cont = new Container(42);
        expect(cont._value).to.equal(42);
    });

    it('should update a value', () => {
        var cont = new Container(42);
        var newVal = cont.update((n) => n + 1);
        expect(newVal).to.equal(43);
        expect(cont._value).to.equal(43);
    });

    it('should update a value using multiple arguments', () => {
        var cont = new Container(42);
        var newVal = cont.update((n, x, y, z) => n / x / y / z, 1, 2, 3);
        expect(cont._value).to.equal(7);
    });
});

describe('isolating change with an immutable container object', () => {
    it('should create a value', () => {
        var cont = ImmutableContainer(42);
        expect(cont.value()).to.equal(42);
    });

    it('should create an updated a value', () => {
        var cont = ImmutableContainer(42);
        var newVal = cont.update((n) => n + 1);

        expect(cont.value()).to.equal(42);
        expect(newVal.value()).to.equal(43);
    });

    it('should create an updated a value using multiple arguments', () => {
        var cont = ImmutableContainer(42);
        var newVal = cont.update((n, x, y, z) => n / x / y / z, 1, 2, 3);

        expect(cont.value()).to.equal(42);
        expect(newVal.value()).to.equal(7);
    });
});
