chai = require 'chai'
chai.use require 'chai-things'
{ expect } = chai

_ = require 'lodash'
{ log, logjson } = require '../src/tools'

intro = require '../src/introducing'
fns = require '../src/fns'
builders = require '../src/fn_builders'

f = _.extend {}, intro, fns, builders

