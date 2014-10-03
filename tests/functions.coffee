{ expect } = require 'chai'

_ = require 'lodash'
{ log, logjson } = require '../src/tools'
fns = require '../src/fns'

anObj =
  first: 'brent'
  second: 'brimhall'
  id: 7482948505

somearr = [ 123, 456, 'lolz' ]

describe 'functionals', ->
  describe 'pick', ->
    it 'should grap specific keys from an object', ->
      val = _.pick anObj, 'first'
      expect(val).to.deep.equal({first: 'brent'})

  describe 'comparator', ->
    testList = []
    testListSorted = []

    beforeEach ->
      testList = [2, 3, -1, -6, 0, -108, 42, 10]
      testListSorted = [-1, -108, -6, 0, 10, 2, 3, 42]

    it 'should sort data', ->
      sorted = testList.sort(fns.lessThanOrEqualSorter)
      expect(sorted)
        .to.deep.include.members(testListSorted)
        .and.have.lengthOf(testList.length)

  describe 'existence', ->
    it 'should falsify null', ->
      expect(fns.existy null).to.equal false

    it 'should falsify undefined', ->
      expect(fns.existy undefined).to.equal false
      expect(fns.existy {}.notHere).to.equal false
      expect(fns.existy (->)()).to.equal false
      expect(fns.existy `void 0`).to.equal false

    it 'should give true for existent, falsy values', ->
      expect(fns.existy 0).to.equal true
      expect(fns.existy false).to.equal true
      expect(fns.existy {}).to.equal true

    it 'should give true for truthy values', ->
      expect(fns.existy true).to.equal true
      expect(fns.existy 'a string').to.equal true
  
  describe 'conditional execution', ->
    it 'should reverse an array', ->
      reversed = fns.executeIfHasField [1,2,3], 'reverse'
      expect(reversed).to.deep.equal [3,2,1]

    it 'should foo if it can!', ->
      foo = fns.executeIfHasField({foo: 42}, 'foo')
      expect(foo).to.equal 42

  describe 'concatenator', ->
    it 'should join arrays', ->
      joined = fns.cat [1,2,3], [4,5], [6,7,8]
      expect(joined).to.deep.equal [1,2,3,4,5,6,7,8]

    it 'should construct values', ->
      constructed = fns.construct 42, [1,2,3]
      expect(constructed).to.deep.equal [42,1,2,3]

    it 'should mapcat', ->
      commas = fns.mapcat ((e) -> fns.construct e, [','] ), [1,2,3]
      expect(commas).to.deep.equal [1,',',2,',',3,',']

    it 'should interpose', ->
      list = fns.interpose ',', [1,2,3]
      expect(list).to.deep.equal [1,',',2,',',3]



