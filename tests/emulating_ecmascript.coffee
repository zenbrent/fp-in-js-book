{ expect } = require 'chai'

_ = require 'lodash'
{ log, logjson } = require '../src/tools'
fns = require '../src/fns'

js = require '../src/emulating_ecmascript'

describe 'dynamic scope', ->
  describe 'stack binder', ->
    it 'should bind values to the global scope', ->
      js.stackBinder 'a', 1
      js.stackBinder 'b', 100
      expect(js.globals).to.have.keys 'a', 'b'

    it 'should pop values from the global scope', ->
      js.stackUnbinder 'a'
      expect(js.globals['a']).to.be.empty

    it 'should make stacks go multiple levels deep', ->
      js.stackBinder 'a', 1
      js.stackBinder 'a', '*'
      expect(js.globals['a']).to.deep.equal [1,'*']

    it 'should look up correct values', ->
      expect(js.dynamicLookup 'a').to.equal '*'
      expect(js.dynamicLookup 'b').to.equal 100
