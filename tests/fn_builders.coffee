chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require '../src/tools'

fns = require '../src/all_fns'
builders = require '../src/fn_builders'

describe.only 'dispatcher', ->
