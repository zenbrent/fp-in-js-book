###
# Chapter 7
###

chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require './fixtures/tools'
fns = require '../src/all_fns'
pure = require '../src/purity'

describe.skip 'functional purity', ->


