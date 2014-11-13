###
# Chapter 7
###

chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require './fixtures/tools'
fns = require '../src/fns'
intro = require '../src/introducing'

describe.skip 'functional purity', ->
