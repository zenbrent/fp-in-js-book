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

    it 'shud interpoaltes', ->
      fns.interpolate(
        ((e) -> fns.construct [","], e),
        somearr
      )
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

###
logjson "mapcat", fns.mapcat(
    ((e) -> fns.construct [","], e),
    somearr
)

logjson "construct", fns.construct 2, [9,9,9,9]
logjson "cat", fns.cat [2], [9,9,9,9]
###
