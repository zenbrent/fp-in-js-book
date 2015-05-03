var _ = require('lodash');
var chai = require('chai');

var fns = require('../src/all_fns');
var recurse = require('../src/recursion');
var { log, logjson } = require('./fixtures/tools');

chai.use(require('chai-things'));
var { expect } = chai;

describe('more recursion', () => {
    describe('generators', () => {
        var { cycle } = recurse
        it('actually not generators, this is not lazy', () => {
            expect(cycle(20, [1,2,3])).length.to.be(60);
            expect(_.take(cycle(20, [1,2,3]), 11)).length.to.be(11);
        });
    });
});
