_ = require 'lodash'

log = (args...) -> console.log args...
  
logjson = (args...) -> log _.map args, (j) -> JSON.stringify j, null, '    '

module.exports = { log, logjson }
