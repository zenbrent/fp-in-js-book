{ expect } = require 'chai'

_ = require 'lodash'
{ log, logjson } = require '../tools'
fns = require '../fns'

sqlFns = require '../sqlish-fns'

# Try the sql-ish things in the book, p16 on.

describe 'sql-like functions', ->
  tableData = ''
  beforeEach ->
    tableData = """
      name, age, hair
      Merble, 35, red
      Bob, 64, blonde
    """

  describe 'reading data', ->
    it 'should get some good data', ->
      table = sqlFns.lameCSV tableData
      expect(table[1]).to.deep.equal ['Merble', '35', 'red']

