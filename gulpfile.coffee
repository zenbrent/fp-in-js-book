path = require 'path'
gulp = require 'gulp'
concat = require 'gulp-concat'
awatch = require 'gulp-autowatch'
source = require 'vinyl-source-stream'
buffer = require 'vinyl-buffer'
mocha = require 'gulp-mocha'
# jsdoc = require 'gulp-jsdoc'

coffeeify = require 'coffeeify'
# browserify = require 'browserify'

# paths: key is the task name, value is the paths to watch.
paths =
  test: ['tests/**/*', 'src/**/*']
  # jsdoc: ['src/**/*.js', 'tests/**/*.js']

# # javascript
# gulp.task 'coffee', ->
#     bCache = {}
#     b = browserify paths.coffeeSrc,
#       debug: true
#       insertGlobals: false
#       cache: bCache
#       extensions: ['.coffee']
#     b.transform coffeeify
#     b.bundle()
#     .pipe source "start.js"
#     .pipe buffer()
#     .pipe gulp.dest paths.public

gulp.task 'jsdoc', ->
  infos =
    name: ''
    description: ''
    version: ''
    licenses: ''
    plugins: false

  name = 'jsdoc.json'

  # Options for the template:
  # https://github.com/terryweiss/docstrap
  template =
    path: 'ink-docstrap'
    systemName: 'sysname?'
    footer: "footer?"
    copyright: '<a href="http://www.wtfpl.net/">WTFPL</a>'
    navType: "vertical"
    theme: "spacelab"
    linenums: true
    collapseSymbols: false
    inverseNav: false

  options =
    private: false
    monospaceLinks: false
    cleverLinks: true
    outputSourceFiles: true

  gulp.src paths.jsdoc, 'README.md'
    .pipe jsdoc.parser(infos, name)
    .pipe jsdoc.generator './docs', template, options
    # .pipe gulp.dest './docs/'

gulp.task 'test', ->
  gulp.src paths.test, { read: false }
    .pipe mocha { reporter: 'spec' }

gulp.task 'watch', ->
  awatch gulp, paths

# gulp.task 'default', ['coffee', 'html', 'stylus', 'server', 'watch']
gulp.task 'default', ['test']
