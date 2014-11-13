{ expect } = require 'chai'

_ = require 'lodash'
{ log, logjson } = require './fixtures/tools'

sql = require '../src/sqlish-fns'

# Try the sql-ish things in the book, p16 on.

describe 'sql-like functions', ->

  describe 'processing data', ->
    tableData = table = null

    beforeEach ->
      tableData = """
        name, age, hair
        Merble, 35, red
        Bob, 64, blonde
      """
      table = sql.lameCSV tableData

    it 'should get some good data', ->
      expect(table[1]).to.deep.equal ['Merble', '35', 'red']

    it 'can be sorted', ->
      # From book p17
      # sort everything but the first line
      sorted = _.rest(table).sort()
      firstVals = sorted.map (row) -> _.first row
      expect(firstVals).to.deep.equal ['Bob', 'Merble']

    it 'can select names', ->
      names = sql.selectNames _.clone table
      expect(names).to.deep.equal ['Merble', 'Bob']

    it 'can select ages', ->
      ages = sql.selectAges _.clone table
      expect(ages).to.deep.equal ['35', '64']

    it 'can select hair color', ->
      hair = sql.selectHairColor _.clone table
      expect(hair).to.deep.equal ['red', 'blonde']

    it 'can merge results together', ->
      # The book aliased _.zip to mergeResults
      data = _.zip sql.selectNames(table), sql.selectAges(table)
      expect(data[0]).to.deep.equal ['Merble', '35']

  describe 'some more advanced stuff', ->
    zombie =
      name: 'Bub'
      film: 'Day of the Dead'

    books = [
      { title: "Chthon", author: "Anthony" }
      { title: "Grendel", author: "Gardner" }
      { title: "After Dark" }
    ]

    library = [
      { title: "SICP", isbn: "0262010771", ed: 1 }
      { title: "SICP", isbn: "0262510871", ed: 2 }
      { title: "Joy of Clojure", isbn: "1935182641", ed: 1 }
    ]

    tableData = """
      name, age, hair
      Merble, 35, red
      Bob, 64, blonde
    """
    table = sql.lameCSV tableData


    it 'should work for basic _ functions', ->
      # Get the keys
      expect(_.keys zombie).to.deep.equal ['name','film']

      # Get the values
      expect(_.values zombie).to.deep.equal ['Bub', 'Day of the Dead']

      # Make the keys upper-case
      upperCase = _.object _.map _.pairs(zombie), (pair) ->
        [pair[0].toUpperCase(), pair[1]]
      expect(upperCase).to.have.keys ['NAME', 'FILM']

      # Make the values keys and vice-versa
      expect(_.invert zombie).to.have.keys ['Bub', 'Day of the Dead']

      # book p42
      # Fill in the list with default values.
      someBooks = _.pluck(
        _.map(books, (obj) -> _.defaults(obj, {author: 'unknown'}))
      , 'author')
      expect(someBooks).to.deep.equal ['Anthony', 'Gardner', 'unknown']

      sicp = _.findWhere library, { title: 'SICP', ed: 2 }
      expect(sicp).to.deep.equal library[1]

      sicps = _.where library, { title: 'SICP' }
      expect(sicps).to.deep.equal [library[0], library[1]]

    describe 'actual sql things', ->
      it 'should project on tables', ->
        # p44
        # Get the table with only the keys 'title' and 'isbn'
        editionResults = sql.project library, ['title', 'isbn']
        expect(editionResults[0]).to.have.keys ['title', 'isbn']

        isbnResults = sql.project editionResults, ['isbn']
        expect(isbnResults[0]).to.have.key 'isbn'

        # Then just pull out the isbn values.
        isbns = _.pluck isbnResults, 'isbn'
        expect(isbns).to.deep.equal ["0262010771", "0262510871", "1935182641"]

      it 'should rename keys', ->
        renamed = sql.rename {a: 1, b: 2}, {'a': 'AAA'}
        expect(renamed).to.deep.equal { AAA: 1, b: 2 }

      it 'should rename keys using "as"', ->
        renamed = sql.as library, { ed: 'edition' }
        expect(renamed[0]).to.contain.key 'edition'

      it 'should work when I chain functions', ->
        vals = sql.project sql.as(library, {ed: 'edition'}), ['edition']
        expect(vals[1]).to.deep.equal {edition: 2}

      it 'should restrict values', ->
        aBook = sql.restrict library, (book) -> book.ed > 1
        expect(aBook[0]).to.deep.equal { title: "SICP", isbn: "0262510871", ed: 2 }
        expect(aBook).to.have.length 1

      it 'can be chained', ->
        sicpBook = sql.restrict(
          sql.project(
            sql.as(library, {ed: 'edition'}),
            ['title', 'isbn', 'edition']
          ),
          (book) -> book.edition > 1
        )
        expect(sicpBook[0]).to.deep.equal { title: "SICP", isbn: "0262510871", edition: 2 }
        expect(sicpBook).to.have.length 1
