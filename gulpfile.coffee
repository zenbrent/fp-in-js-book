path = require 'path'
gulp = require 'gulp'
concat = require 'gulp-concat'
awatch = require 'gulp-autowatch'
source = require 'vinyl-source-stream'
buffer = require 'vinyl-buffer'
mocha = require 'gulp-mocha'
# docker = require './gulp_wrappers/docker.js'
_ = require 'lodash'

# jsdoc = require 'gulp-jsdoc'

coffeeify = require 'coffeeify'
# browserify = require 'browserify'

# paths: key is the task name, value is the paths to watch.
paths =
  test: ['tests/**/*', 'src/**/*']

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

# gulp.task "docker", ->
#   gulp.src paths.docker
#     .pipe docker {
#       outputType: "bare",
#       wrapped: true
#     }
#     .pipe gulp.dest './docs'
  

gulp.task 'test', ->
  reporters = { 'html-cov', 'spec', 'nyan', 'dot', 'landing', 'tap', 'list', 'progress', 'json-stream', 'min', 'doc' }
  gulp.src ['tests/*.coffee', 'tests/*.js'], { read: false }
    .pipe mocha reporter: reporters['spec']
    # .pipe mocha { reporter: _.keys(reporters)[_.random(0,_.keys(reporters).length, false)] }

gulp.task 'watch', ->
  awatch gulp, paths

# gulp.task 'default', ['coffee', 'html', 'stylus', 'server', 'watch']
gulp.task 'default', ['test', 'watch']
