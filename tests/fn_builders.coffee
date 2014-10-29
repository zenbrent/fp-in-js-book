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

  describe 'currying', ->
    { curry, curry2, curry3 } = builders

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



    describe 'configuring lodash functions', ->
      plays = [
        {artist: "Burial", track: "Archangel"}
        {artist: "Ben Frost", track: "Stomp"}
        {artist: "Ben Frost", track: "Stomp"}
        {artist: "Burial", track: "Archangel"}
        {artist: "Emeralds", track: "Snores"}
        {artist: "Burial", track: "Archangel"}]

      playedSongs = [
        {artist: "Burial", track: "Archangel"}
        {artist: "Ben Frost", track: "Stomp"}
        {artist: "Emeralds", track: "Snores"}]

      countedPlays =
        'Burial - Archangel': 3
        'Ben Frost - Stomp': 2
        'Emeralds - Snores' : 1

      songToString = (song) -> "#{song.artist} - #{song.track}"

      it 'should create a configured countBy fn', ->
        songCount = curry2(_.countBy)(songToString)
        expect songCount plays
        .to.deep.equal countedPlays

      it 'should create more configs', ->
        songsPlayed = curry3(_.uniq)(false)(songToString)
        expect songsPlayed plays
        .to.deep.equal playedSongs

      it 'should work with rgbs', ->
        { rgbToHexString } = builders
        expect rgbToHexString 255, 255, 255
        .to.equal '#ffffff'

    describe 'fluent APIs', ->
      { checker, validator } = fns
      it 'should create a fluent checker', ->
        greaterThan = curry2 (lhs, rhs) -> lhs > rhs
        lessThan = curry2 (lhs, rhs) -> lhs < rhs
        withinRange = checker(
          validator 'arg must be greater than 10', greaterThan 10
          validator 'arg must be less than 20', lessThan 20
        )

        expect(withinRange 5).to.deep.equal ['arg must be greater than 10']
        expect(withinRange 15).to.be.empty
        expect(withinRange 25).to.deep.equal ['arg must be less than 20']

  describe.only 'partial application', ->
    { partial, partial1, partial2 } = builders
    div = (a, b) -> a / b

    it 'partial1 should apply 1 argument', ->
      over10Part1 = partial1 div, 10
      expect(over10Part1 5).to.equal 2

    it 'partial2 should apply 2 arguments', ->
      over10By2 = partial2 div, 10, 2
      expect(over10By2()).to.equal 5

    it 'partial should apply n arguments!', ->
      over10Part1 = partial div, 10
      expect(over10Part1 5).to.equal 2

      over10By2 = partial div, 10, 2
      expect(over10By2()).to.equal 5
      
      div10By2By4By5000Partial = partial div, 10, 2, 4, 5000
      expect(div10By2By4By5000Partial()).to.equal 5
      # N.B. this is still only using the 1st 2 arguments! Don't be an ass with partial.
