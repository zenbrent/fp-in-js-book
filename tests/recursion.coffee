###
# Chapter 6
###

chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require './fixtures/tools'
fns = require '../src/all_fns'
recurse = require '../src/recursion'

describe.only 'recursion', ->
  describe 'some very basic things', ->
    { recurseLength, cycle } = recurse

    it 'should make a dumb length method', ->
      expect(recurseLength []).to.equal 0
      expect(recurseLength [1,5,5,8]).to.equal 4
      expect(recurseLength [null, undefined]).to.equal 2

    it 'should repeat an array', ->
      expect(cycle 0, []).to.deep.equal []
      expect(cycle 1, [1,2,3]).to.deep.equal [1,2,3]
      expect(cycle 3, [1,2,3]).to.deep.equal [1,2,3,1,2,3,1,2,3]

    describe 'unzipping', ->
      { constructPair, unzip } = recurse

      it 'should reverse a single value from _.zip', ->
        a = [['a'], [1]]
        pair = _.zip.apply(null, a)[0]
        expect(constructPair pair, [[],[]]).to.deep.equal a
        expect(constructPair [[],[]], [[],[]]).to.deep.equal [[[]],[[]]]

        set = [['a', 'b', 'c'], [1, 2, 3]]
        z = _.zip set
        expect constructPair z[0], constructPair z[1], constructPair z[2], [[],[]]
        .to.deep.equal set

      it 'should build up values when called multiple times', ->
        expect constructPair ['a', '1'],
          constructPair ['b', '2'],
            constructPair ['c', '3'], [[],[]]
        .to.deep.equal [['a', 'b', 'c'], ['1', '2', '3']]

      it 'should work as a recursive function!', ->
        expect unzip [['a', 1], ['b', 2]]
        .to.deep.equal [['a', 'b'], [1, 2]]

      it 'although note _.zip reverses itself...', ->
        pairs = [['a', '1'], ['b', '2'], ['c', '3']]
        zipped = [['a', 'b', 'c'], ['1', '2', '3']]

        expect(_.zip pairs).to.deep.equal zipped
        expect(_.zip zipped).to.deep.equal pairs

  describe 'graph walking with recursion!', ->
    { nexts } = recurse

    # A graph shown as kvps
    influences = [
      ['Lisp', 'Smalltalk'],
      ['Lisp', 'Scheme'],
      ['Smalltalk', 'Self'],
      ['Scheme', 'JavaScript'],
      ['Scheme', 'Lua'],
      ['Self', 'Lua'],
      ['Self', 'JavaScript']
    ]

    it 'should walk a tree', ->
      ni = _.partial(nexts, influences)
      expect(ni 'Lisp').to.deep.equal ['Smalltalk', 'Scheme']
      expect(ni 'Smalltalk').to.deep.equal ['Self']
      expect(ni 'Scheme').to.deep.equal ['JavaScript', 'Lua']

    describe 'depth first recursive search with memory', ->
      { depthSearch } = recurse
      it 'should go down a line', ->
        expect depthSearch(influences, ['Lisp'], [])
        .to.deep.equal ['Lisp', 'Smalltalk', 'Self', 'Lua', 'JavaScript', 'Scheme']
