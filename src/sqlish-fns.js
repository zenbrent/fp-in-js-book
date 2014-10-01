_ = require('lodash');
fns = require('./fns');

/** from p16 */
function lameCSV(str) {
  return _.reduce(str.split("\n"), function(table, row) {
    table.push(_.map(row.split(","), function(c) { return c.trim() }));
    return table;
  }, []);
}

// from p17
function selectNames(table) {
  return _.rest(_.map(table, _.first));
}

// from p18
function selectAges(table) {
  _.rest(_.map(table, fns.second));
}

module.exports = {
  lameCSV: lameCSV,
  selectNames: selectNames,
  selectAges: selectAges
}
