/**
 * It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures.
 *   – Alan Perlis
 *
 * This file is for the first chapter of the book, introducing functional programming.
 */

_ = require('lodash');

/** defined on p12 */
function isIndexed(data) {
  return _.isArray(data) || _.isString(data);
}

/** defined p9 */
function fail(thing) {
  throw new Error(thing);
}
function warn(thing) {
  console.warn(thing);
}

/** defined p12 */
function nth(a, index) {
  if (!_.isNumber(index)) fail("Expected a number as the index");
  if (!isIndexed(a)) fail("Not supported on non-indexed type");
  if ((index < 0) || (index > a.length - 1))
    fail("Index value is out of bounds"); return a[index];
}

function second(a) {
  return nth(a, 1);
}

// defined on p14
// Map a predicate to a comparator
function comparator(pred) {
  return function (x, y) {
    if (truthy(pred(x, y)))
      return -1;
    else if (truthy(pred(y, x)))
      return 1;
    else
      return 0;
  };
}

// defined on p14
function lessOrEqual(x,y) {
  return x <= y;
}

// defined on p14
var lessThanOrEqualSorter = comparator(lessOrEqual);

// defined on p
function existy(arg) {
  return arg != null;
}

// defined on p
function truthy(arg) {
  return arg !== false && existy(arg);
}

/** defined on p20 */
function doWhen(cond, action) {
  if(truthy(cond))
    return action();
  else
    return undefined;
}

/** defined on p20 */
function executeIfHasField(target, name) {
  // Using existy instead of _.has because _.has only checks
  // self-keys.
  return doWhen(existy(target[name]), function() {
    return _.result(target, name);
  });
}

module.exports = {
  fail: fail,
  nth: nth,
  second: second,
  comparator: comparator,
  lessOrEqual: lessOrEqual,
  lessThanOrEqualSorter: lessThanOrEqualSorter,
  existy: existy,
  truthy: truthy,
  doWhen: doWhen,
  executeIfHasField: executeIfHasField,
  warn: warn,
}
