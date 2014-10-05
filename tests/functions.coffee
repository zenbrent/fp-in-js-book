chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require '../src/tools'
fns = require '../src/fns'

# .to.deep.include.members(testListSorted)
# .and.have.lengthOf(testList.length)

describe 'functionals', ->
  anObj =
    first: 'brent'
    last: 'brimhall'
    id: 7482948505

  anArr = ['first', 'second', 'third']

  testList = [2, 3, -1, -6, 0, -108, 42, 10]
  testListSorted = [-108, -6, -1, 0, 2, 3, 10, 42]

  describe 'pick', ->
    it 'should grap specific keys from an object', ->
      val = _.pick anObj, 'first'
      expect(val).to.deep.equal({first: 'brent'})

  describe 'comparator', ->
    it 'should sort data', ->
      sorted = testList.sort(fns.lessThanOrEqualSorter)
      expect(sorted).to.deep.equal(testListSorted)

  describe 'existence', ->
    { existy } = fns

    it 'should falsify null', ->
      expect(existy null).to.equal false

    it 'should falsify undefined', ->
      expect(existy undefined).to.equal false
      expect(existy {}.notHere).to.equal false
      expect(existy (->)()).to.equal false
      expect(existy `void 0`).to.equal false

    it 'should give true for existent, falsy values', ->
      expect(existy 0).to.equal true
      expect(existy false).to.equal true
      expect(existy {}).to.equal true

    it 'should give true for truthy values', ->
      expect(existy true).to.equal true
      expect(existy 'a string').to.equal true
  
  describe 'conditional execution', ->
    { executeIfHasField } = fns

    it 'should reverse an array', ->
      reversed = executeIfHasField [1,2,3], 'reverse'
      expect(reversed).to.deep.equal [3,2,1]

    it 'should foo if it can!', ->
      foo = executeIfHasField({foo: 42}, 'foo')
      expect(foo).to.equal 42

  describe 'concatenator', ->
    { cat, construct, mapcat, interpose } = fns

    it 'should join arrays', ->
      joined = cat [1,2,3], [4,5], [6,7,8]
      expect(joined).to.deep.equal [1,2,3,4,5,6,7,8]

    it 'should construct values', ->
      constructed = construct 42, [1,2,3]
      expect(constructed).to.deep.equal [42,1,2,3]

    it 'should mapcat', ->
      commas = mapcat ((e) -> construct e, [','] ), [1,2,3]
      expect(commas).to.deep.equal [1,',',2,',',3,',']

    it 'should interpose', ->
      list = interpose ',', [1,2,3]
      expect(list).to.deep.equal [1,',',2,',',3]

  describe 'compliments', ->
    {  isEven, isOdd } = fns

    it 'even should return true for evens', ->
      expect(isEven 2).to.be.true
      expect(isEven 11).to.be.false

    it 'even\'s compliment should return true for odds', ->
      expect(isOdd 2).to.be.false
      expect(isOdd 11).to.be.true

  describe 'plucker', ->
    it 'should grab fields', ->
      getLastName = fns.plucker 'last'
      expect(getLastName anObj).to.equal 'brimhall'

    it 'should grab items from an array', ->
      getSecond = fns.plucker 1
      expect(getSecond anArr).to.equal 'second'

  describe 'finder', ->
    { finder, plucker } = fns
    it 'should find the max/min in a list of values', ->
      min = finder(_.identity, Math.min, testList);
      expect(min).to.equal _.first(testListSorted)

      max = finder(_.identity, Math.max, testList)
      expect(max).to.equal _.last(testListSorted)

    describe 'working with plucker', ->
      people = [{name: "Fred", age: 65}, {name: "Lucy", age: 36}]

      it 'can find the oldest person', ->
        oldest = finder plucker('age'), Math.max, people
        expect(oldest).to.equal people[0]

      it 'can prefer the name of a person with a specific first letter of their name', ->
        l = finder plucker('name'),
          (x,y) -> if x.charAt(0) is 'L' then x else y,
          people
        expect(l).to.equal people[1]

  describe 'best', ->
    { best } = fns
    # best is like finder, but it abstracts the whole if then else thing for the
    # bestFun.
    it 'should find the best value in a list of numbers', ->
      biggest = best ((x,y) -> x > y), testList
      expect(biggest).to.equal _.last testListSorted

