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

  describe 'hiding data in a function', ->
    { pingpong } = js

    it 'shouldn\'t give access to the private value', ->
      expect(pingpong).to.not.have.key 'privateVal'

    it 'should have access to it\'s own values', ->
      expect(pingpong.inc(1)).to.equal 1
      expect(pingpong.inc(3)).to.equal 4
      expect(pingpong.dec(2)).to.equal 2

    it.skip 'shouldn\'t give access to new functions', ->
      # Not sure how to actually do this -- it throws and makes the test fail.
      # There has to be a library somewhere to intercept errors, right?
      # TODO: Actually, this should be easy to do with the IO hooks - just grab stderr and check the output.
      pingpong.newFn = ->
        expect(privateVal).to.not.exist
        return 'done'

      expect(pingpong.newFn()).to.equal 'done'

