/**
 * From chapters 1 and 2.
 */

_ = require('lodash');
fns = require('./all_fns');

/** from p16 */
function lameCSV(str) {
  return _.reduce(str.split("\n"), function(table, row) {
    table.push(_.map(row.split(","), function(c) { return c.trim(); }));
    return table;
  }, []);
}

/** defined p17 */
function selectNames(table) {
  return _.rest(_.map(table, _.first));
}

/** defined p18 */
function selectAges(table) {
  return _.rest(_.map(table, fns.second));
}

/** defined p18 */
function selectHairColor(table) {
  return _.rest(_.map(table, function(row) {
    return fns.nth(row, 2);
  }));
}

/** defined p44 */
function project(table, keys) {
  return _.map(table, function(obj) {
    return _.pick.apply(null, fns.construct(obj, keys));
  });
}

/**
* defined p46
* rename keys based on a renaming criteria map.
* N.B. uses reduce to create a new object, while maintaining the
* 'mapiness' of the accumlator.
*/
function rename(obj, newNames) {
  return _.reduce( newNames, function(o, nu, old) {
    if (_.has(obj, old)) {
      o[nu] = obj[old];
      return o;
    }
    else
      return o;
  },
  _.omit.apply(null, fns.construct(obj, _.keys(newNames))));
}


/**
* defined p46
* Uses rename against the table abstraction
*/
function as(table, newNames) {
  return _.map(table, function(obj) {
    return rename(obj, newNames); });
}

/**
* defined p47
* The restrict function takes a function that acts as a predicate
* against each object in the table. Whenever the predicate returns
* a falsey value, the object is disregarded in the final table. 
*/
function restrict(table, pred) {
  return _.reduce(table, function(newTable, obj) {
    if (fns.truthy(pred(obj)))
      return newTable;
    else
      return _.without(newTable, obj);
  }, table);
}

module.exports = {
  as: as,
  lameCSV: lameCSV,
  project: project,
  rename: rename,
  restrict: restrict,
  selectAges: selectAges,
  selectHairColor: selectHairColor,
  selectNames: selectNames,
};
