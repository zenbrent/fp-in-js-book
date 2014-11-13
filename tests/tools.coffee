{ expect } = require 'chai'

_ = require 'lodash'
tools = require './fixtures/tools'

describe 'tools for testing', ->
  testData =
    string:
      data: 'asdf'
      logged: ['asdf\n']

    object:
      data: { key: 'val', another: 555 }
      logged: [ '{ key: \'val\', another: 555 }\n' ]

    multiple:
      data: ['asdf', 'qwer', 'uiop']
      logged: ['asdf\n', 'qwer\n', 'uiop\n']

  describe 'intercepting console logging', ->
    { captureStdout } = tools
    it 'should capture console.log', ->
      getLogs = captureStdout()
      console.log testData.string.data
      expect(getLogs()).to.deep.equal testData.string.logged

    it 'should capture console.info', ->
      getLogs = captureStdout()
      console.info testData.string.data
      expect(getLogs()).to.deep.equal testData.string.logged

    describe 'console.dir', ->
      it 'should capture object literals', ->
        { data, logged } = testData.object
        getLogs = captureStdout()
        console.dir data
        expect(getLogs()).to.deep.equal logged

      it 'should capture strings', ->
        { data, logged } = testData.string
        getLogs = captureStdout()
        console.dir testData.string.data
        expect(getLogs()).to.deep.equal ["'asdf'\n"]

    it 'should capture multiple console.logs', ->
      { data, logged } = testData.multiple
      getLogs = captureStdout()
      console.log data[0]
      console.log data[1]
      console.log data[2]
      expect(getLogs()).to.deep.equal logged


  describe 'logging', ->
    { log, log1, logdir, captureStdout } = tools
    it 'should log text', ->
      { data, logged } = testData.multiple
      getLogs = captureStdout()
      log data[0]
      log data[1]
      log data[2]
      expect(getLogs()).to.deep.equal logged

    it 'should log single items in a list', ->
      { data } = testData.multiple
      { logged } = testData.string
      getLogs = captureStdout()
      log1.apply null, data
      expect(getLogs()).to.deep.equal logged

    it 'should log everything in a _.map', ->
      { data, logged } = testData.multiple
      getLogs = captureStdout()
      _.map data, log1
      expect(getLogs()).to.deep.equal logged
