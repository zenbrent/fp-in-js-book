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

describe 'recursion', ->
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

      it 'should reverse a view values from _.zip', ->
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

  describe 'recursion and composition', ->
    { andify, orify } = recurse

    it 'should check if all numbers are even', ->
      evenNums = andify _.isNumber, fns.isEven

      expect(evenNums 1).to.be.false
      expect(evenNums 2).to.be.true
      expect(evenNums 2, 1, 2).to.be.false
      expect(evenNums 2, 4, 10).to.be.true

    it 'should check if any numbers are zero or odd', ->
      oddNum = orify fns.isOdd, fns.zero

      expect(oddNum 0).to.be.true
      expect(oddNum 1).to.be.true
      expect(oddNum 2).to.be.false
      expect(oddNum 1, 7, 11).to.be.true
      expect(oddNum 2, 8, 4).to.be.false
      expect(oddNum 2, 8, 0, 4).to.be.true

  describe 'mutual recursion', ->
    { even, flat, deepClone } = recurse

    it 'should check if a number is even', ->
      expect(even 0).to.be.true
      expect(even 1).to.be.false
      expect(even 10).to.be.true
      expect(even 11).to.be.false
      expect(even -11).to.be.false

    it 'should flattan an array', ->
      array = [1, 2, [3], [4, 5, [6], 7, [8, 9]], 0]

      expect(flat array).to.deep.equal [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

    it 'should deep clone an object', ->
      x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}]

      y = deepClone x
      y[0]['a'][1] = 5

      expect(x).to.not.deep.equal y
      expect(y).to.deep.equal [{a: [1, 5, 3], b: 42}, {c: {d: []}}]

    describe 'visit', ->
      {visit} = recurse

      expect(visit _.identity, _.isNumber, 42).to.be.true
      expect(visit _.isNumber, _.identity, [1, null, 5, 'a']).to.deep.equal [true, false, true, false]
      expect(visit ((n) -> n * 2 ), fns.rev, _.range(4)).to.deep.equal [6, 4, 2, 0]

    describe 'mc depth walking', ->
      {postDepth, preDepth, influencedWithStrategy} = recurse

      influences = [
        ['Lisp', 'Smalltalk'],
        ['Lisp', 'Scheme'],
        ['Smalltalk', 'Self'],
        ['Scheme', 'JavaScript'],
        ['Scheme', 'Lua'],
        ['Self', 'Lua'],
        ['Self', 'JavaScript']
      ]

      it 'should walk trees', ->
        postWalkedInfluences = postDepth _.identity, influences
        expect(postWalkedInfluences).to.deep.equal influences
        postWalkedInfluences[1][1] = 'Clojure'
        expect(postWalkedInfluences).to.not.deep.equal influences

        preWalkedInfluences = postDepth _.identity, influences
        expect(preWalkedInfluences).to.deep.equal influences

        capitalizedLisp = postDepth(
          (x) -> if x is 'Lisp' then 'LISP' else x
          influences
        )
        manuallyCapitalizedLisp = postDepth _.identity, influences
        manuallyCapitalizedLisp[0][0] = manuallyCapitalizedLisp[1][0] = 'LISP'

        expect(capitalizedLisp).to.deep.equal manuallyCapitalizedLisp

      it 'should get a list of languages that were influenced by a specific lang', ->
        influencedByLisp = influencedWithStrategy postDepth, 'Lisp', influences
        expect(influencedByLisp).to.deep.equal ['Smalltalk', 'Scheme']

  describe 'trampolines', ->
    {evenOline, trampoline} = recurse

    it 'should trampoline the even/odd functions', ->
      expect(evenOline(5)).to.be.a.function
      expect(evenOline(5)()()()()()).to.be.false
      expect(evenOline(6)()()()()()()).to.be.true

    it 'should auto-trampoline the even/odd functions', ->
      expect(trampoline evenOline 5).to.be.a.function
      expect(trampoline evenOline 5).to.be.false
      expect(trampoline evenOline 6).to.be.true

