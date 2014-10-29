chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require '../src/tools'

fns = require '../src/all_fns'
builders = require '../src/fn_builders'

describe 'function builders', ->
  describe 'dispatcher', ->
    { dispatch } = builders
    { invoker, always } = fns
    describe 'a stringifying function', ->
      str = dispatch(
        invoker 'toString', Array::toString
        invoker 'toString', String::toString
      )

      it 'should convert strings and arrays to strings', ->
        expect(str ['a','b',55]).to.equal 'a,b,55'
        expect(str 'some text').to.equal 'some text'

      it "shouldn't convert other things", ->
        expect(str 1234).to.be.undefined
        expect(str {}).to.be.undefined
        expect(str ->).to.be.undefined


      stringReverse = (s) ->
        if !_.isString(s)
        then undefined
        else s.split('').reverse().join("")

      # Reverse strings or arrays
      rev = dispatch(
        invoker('reverse', Array.prototype.reverse)
        stringReverse
      )

      it 'can work with fns that aren\'t invokers', ->
        expect(rev 'asdf').to.equal 'fdsa'
        expect(rev [1,2,3,4]).to.deep.equal [4,3,2,1]

      it 'can use dispatchers as arguments, have a fallthrough fn', ->
        sillyReverse = dispatch rev, always 42
        
        expect(sillyReverse [1,2,3]).to.deep.equal [3,2,1]
        expect(sillyReverse 'abc').to.equal 'cba'
        expect(sillyReverse 100000).to.equal 42

      describe 'extending dispatchers', ->
        notify = (msg) -> 'Notified ' + msg
        changeView = (view) -> 'Changed to ' + view
        shutdown = (host) -> 'Shutdown ' + host

        isa = (type, action) ->
          (obj) -> action(obj) if type is obj.type

        performCommand = dispatch(
          isa('notify', (o) -> notify o.message)
          isa('join', (o) -> changeView o.target)
          (o) -> _.bindKey console, 'error'
        )

        it 'should check value types', ->
          expect performCommand type: 'notify', message: 'LOL'
          .to.equal 'Notified LOL'

          expect performCommand type: 'join', target: 'view'
          .to.equal 'Changed to view'

        performAdminCommand = dispatch(
          isa('kill', (o) -> shutdown o.hostname)
          performCommand
        )

        it 'should work with admin commands', ->
          expect performAdminCommand type: 'join', target: 'view'
          .to.equal 'Changed to view'

          expect performAdminCommand type: 'kill', hostname: 'localhost'
          .to.equal 'Shutdown localhost'

        performTrialUserCommand = dispatch(
          isa('join', (obj) -> 'Cannot join until approved')
          performCommand
        )
        it 'should override behavior', ->
          expect performTrialUserCommand type: 'join', target: 'foos'
          .to.equal 'Cannot join until approved'

          expect performCommand type: 'notify', message: 'LOL'
          .to.equal 'Notified LOL'

  describe.only 'currying', ->
    { curry, curry2 } = builders

    it 'should allow iterating with parseInt', ->
      elevensS = ['11','11','11','11','11']
      elevensN = [11,11,11,11,11]
      threesN = [3,3,3,3,3]

      # parseInt takes a radix, so the 2nd argument to map screws it up
      expect(_.map elevensS, parseInt).to.not.deep.equal elevensN

      # so curry it down to 1 argument.
      expect(_.map elevensS, curry parseInt).to.deep.equal elevensN

      # or do binary strings
      expect(_.map elevensS, curry2(parseInt)(2)).to.deep.equal threesN

