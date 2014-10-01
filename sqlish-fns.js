_ = require('lodash');

function lameCSV(str) {
  return _.reduce(str.split("\n"), function(table, row) {
    table.push(_.map(row.split(","), function(c) { return c.trim() }));
    return table;
  }, []);
};

module.exports = {
  lameCSV: lameCSV
}
