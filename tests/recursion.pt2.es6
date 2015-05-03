var _ = require('lodash');
var chai = require('chai');

var fns = require('../src/all_fns');
var recurse = require('../src/recursion');
var { log, logjson } = require('./fixtures/tools');

chai.use(require('chai-things'));
var { expect } = chai;

describe('more recursion', () => {
    describe('generators', () => {
        var { cycle } = recurse;
        it('actually not generators, this is not lazy', () => {
            expect(cycle(20, [1,2,3])).length.to.be(60);
            // Note: this is generating all the values and trimming them down.
            // Not terribly efficient.
            expect(_.take(cycle(20, [1,2,3]), 11)).length.to.be(11);
        });

        var {generator, genHead, genTail, genTake} = recurse;
        var ints = generator(0, _.identity, (n) => n + 1);

        it('should generate a value', () => {
            expect(genHead(ints)).to.equal(0);
            expect(genHead(
                genTail(genTail(genTail(ints)))
            )).to.equal(3);
        });

        it('should generate a list of values', () => {
            expect(genTake(10, ints))
            .to.deep.equal(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            );
        });

        it('should generate a list of values that would blow the stack if done recursively', () => {
            expect(genTake(1000, ints).length).to.equal(1000);
        });
    });
});
