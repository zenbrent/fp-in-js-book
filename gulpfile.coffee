path = require 'path'
gulp = require 'gulp'
concat = require 'gulp-concat'
awatch = require 'gulp-autowatch'
source = require 'vinyl-source-stream'
buffer = require 'vinyl-buffer'
mocha = require 'gulp-mocha'

coffeeify = require 'coffeeify'
# browserify = require 'browserify'

# paths: key is the task name, value is the paths to watch.
paths =
  test: ['tests/**/*.js', 'tests/**/*.coffee']

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


gulp.task 'test', ->
  gulp.src paths.test, { read: false }
    .pipe mocha { reporter: 'spec' }

gulp.task 'watch', ->
  awatch gulp, paths

# gulp.task 'default', ['coffee', 'html', 'stylus', 'server', 'watch']
gulp.task 'default', ['test']
