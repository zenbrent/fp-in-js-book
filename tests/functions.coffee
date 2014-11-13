chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require './fixtures/tools'
fns = require '../src/fns'
intro = require '../src/introducing'

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
      sorted = testList.sort(intro.lessThanOrEqualSorter)
      expect(sorted).to.deep.equal(testListSorted)

  describe 'existence', ->
    { existy } = intro

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
    { executeIfHasField } = intro

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
    # best is like finder, but it abstracts the whole if then else thing for the bestFun.
    it 'should find the best value in a list of numbers', ->
      biggest = best ((x,y) -> x > y), testList
      expect(biggest).to.equal _.last testListSorted


  describe 'repeats', ->
    { always, repeat, repeatedly, iterateUntil } = fns

    it 'should repeat text', ->
      majors = repeat 4, 'Major'
      expect(majors).to.deep.equal ['Major', 'Major', 'Major', 'Major' ]

    it 'should repeatedly calculate a random number', ->
      randoms = repeatedly 50, _.bind(_.random, null, 3, 5, false)
      expect(randoms)
      .to.all.be.within(3, 5)
      .and.to.have.lengthOf 50

    it 'should always give a string', ->
      expect repeatedly(10, always "some value")
      .to.all.equal 'some value'

    it 'should create HTML elements with unique IDs', ->
      # Mostly for illustrative purposes. This might end up being super useful in
      # react. Actually, maybe react can be use to generate elements in testing.
      # Of course, these aren't pure functions, so we can def do better. Later
      # in the book.
      dom = []
      ids = repeatedly 3, (n) ->
        id = "id#{n}"
        dom.push "<p id='#{id}'>Odelay!</p>"
        return id

      expect(ids).to.deep.equal [ 'id0', 'id1', 'id2' ]
      expect(dom).to.deep.equal [ "<p id='id0'>Odelay!</p>", "<p id='id1'>Odelay!</p>", "<p id='id2'>Odelay!</p>" ]

    it 'should double a number until it reaches 1024', ->
      expect iterateUntil ((v) -> v * 2), ((v) -> v <= 1024), 1
      .to.deep.equal [2,4,8,16,32,64,128,256,512,1024]

  describe 'invoker', ->
    { invoker } = fns
    it 'should be able to reverse an array or two', ->
      rev = invoker 'reverse', Array::reverse
      expect _.map [[1,2,3]], rev
      .to.deep.equal [[3,2,1]]

      expect _.map [[1,2,3], [9,8,7], 'asdf'], rev
      .to.deep.equal [[3,2,1], [7,8,9], undefined]

  describe 'private members', ->
    # When a fn only relies on its arguments to create its return value, it has
    # 'referential transparency'. These do not have ref transp, which adds complexity.

    it 'should not be accessible from outside', ->
      omgenerator = ((init) ->
        counter = init
        return uniqueString: (prefix) -> [prefix, counter++].join('')
      )(0)

      expect _.times 5, _.bindKey omgenerator, 'uniqueString', 'prefix-'
      .to.deep.equal ['prefix-0', 'prefix-1', 'prefix-2', 'prefix-3', 'prefix-4']

      # Fix this test when I care about capturing errors...
      # expect _.times 5, _.bind {counter: 1337}, omgenerator, 'prefix-'
      #   .to.deep.equal ['prefix-0', 'prefix-1', 'prefix-2', 'prefix-3', 'prefix-4']

    it 'should be more simple, but not as protected', ->
      generator =
        count: 0
        uniqueString: (prefix) -> [prefix, this.count++].join('')

      expect _.times 5, _.bindKey generator, 'uniqueString', 'prefix-'
      .to.deep.equal ['prefix-0', 'prefix-1', 'prefix-2', 'prefix-3', 'prefix-4']

      # Fix this test when I care about capturing errors...
      expect generator.uniqueString.call {count: 1337}, 'prefix-'
      .to.equal 'prefix-1337'

  describe 'fnull', ->
    { fnull } = fns
    nums = [1, 2, 3, null, 5]
    it 'should make a multiplier', ->
      # A function that will take a pair of numbers and multiply them.
      # If either is falsy, it will default to 1.
      safeMult = fnull(((total, n) -> total * n), 1, 1)

      expect _.reduce [], safeMult
      .to.be.undefined

      expect _.reduce [null, null], safeMult
      .to.equal 1

      expect _.reduce nums, safeMult
      .to.equal 30

    describe 'defaults', ->
      { defaults } = fns
      it 'should fill in default arguments', ->
        doSomething = (config) ->
          lookup = defaults { critical: 100 }
          return lookup config, 'critical'

        expect doSomething({})
        .to.equal 100

  describe 'checker and validators', ->
    { checker, always, validator, hasKeys } = fns
    aMap = (obj) -> _.isObject obj

    it 'should make an always-passer', ->
      alwaysPasses = checker(always(true), always(true))

      expect alwaysPasses {}
      .to.deep.equal []

      expect alwaysPasses { any: 'old', set: 'of', k:3,y:5 }
      .to.deep.equal []

    it 'should make an always-failer that gives 2 messages', ->
      fails = validator 'This always just dies.', always(false)

      failsHard = always false
      failsHard.message = 'This REALLY dies.'

      alwaysFails = checker fails, failsHard

      expect alwaysFails {}
      .to.deep.equal ['This always just dies.', 'This REALLY dies.']


    it 'should be able to tell if something is a map', ->
      aMap = (obj) -> _.isObject obj
      checkCommand = checker validator 'must be a map', aMap
      expect(checkCommand {}).to.deep.equal []
      expect(checkCommand 42).to.deep.equal ['must be a map']

    it 'should check the to make sure an object has specific keys', ->
      checkKeys = checker(
        validator('Must be a map', aMap)
        hasKeys 'msg', 'type'
      )

      expect(checkKeys anObj).to.deep.equal ['Must have values for keys: msg type']
      expect(checkKeys msg: null, type: undefined ).to.be.empty
      expect(checkKeys 7 ).to.deep.equal [
        'Must be a map'
        'Must have values for keys: msg type'
      ]
