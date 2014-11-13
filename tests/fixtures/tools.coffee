_ = require 'lodash'

# Log something
log = _.bindKey console, 'log'

# Log a single item. Good for passing in as a callback.
log1 = _.compose log, _.identity

logdir = _.bindKey console, 'dir'

###
# Hook into a stream, and return a function to reset it.
# Pass in the stream to replace, a function to call everytime the
# stream recieves a value, and a function to call for the return
# value of the returned function. This allows you to give an accumulator
# function as the callback, and return the final value when unhooking
# from the stream.
###
hookStream = (_stream, fn, complete) ->
  # Reference default write method
  old_write = _stream.write
  # _stream now write with our shiny function
  _stream.write = fn

  return ->
    # reset to the default write method
    _stream.write = old_write
    complete?()

###
# Start grabbing the values from stdout in an array.
# Returns a function that stopps the stdout interception and returns
# an array of strings of what was stdout'd.
# Check the tests for usage examples.
###
captureStdout = ->
# Assign logs inside the closure
  logs = []
  return hookStream process.stdout,
    (string, encoding, fd) -> logs.push string,
    -> logs

# Now do what you want with logs stored by the hook
# logs.forEach (_log) ->
#   console.log 'logged: ' + _log


module.exports = {
  log, logdir, log1, captureStdout
}
