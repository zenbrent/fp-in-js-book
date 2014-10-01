{ expect } = require 'chai'

_ = require 'lodash'
{ log, logjson } = require '../src/tools'
fns = require '../src/fns'

sqlFns = require '../src/sqlish-fns'

# Try the sql-ish things in the book, p16 on.

describe 'sql-like functions', ->
  tableData = ''
  table = []

  beforeEach ->
    tableData = """
      name, age, hair
      Merble, 35, red
      Bob, 64, blonde
    """
    table = sqlFns.lameCSV tableData

  describe 'reading data', ->
    it 'should get some good data', ->
      expect(table[1]).to.deep.equal ['Merble', '35', 'red']

  describe 'processing data', ->
    it 'can be sorted', ->
      # From book p17
      # sort everything but the first line
      sorted = _.rest(table).sort()
      firstVals = sorted.map (row) -> _.first row
      expect(firstVals).to.deep.equal ['Bob', 'Merble']

    it 'can select names', ->
        

