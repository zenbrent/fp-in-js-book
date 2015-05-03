var chai = require('chai');
chai.use(require('chai-things'));

var { expect } = chai;

var _ = require('lodash');
var { log, logjson } = require('./fixtures/tools');
var fns = require('../src/all_fns');
var recurse = require('../src/recursion');

describe('more recursion', () => {
    describe('generators', () => {
        it('should do shiz', () => {
            expect(false).to.be.false;
        });
    });
});
