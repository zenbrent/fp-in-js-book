/**
 * It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures.
 *   – Alan Perlis
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

// defined on p
/* check this */
function allOf() {
  return _.reduceRight(
    arguments,
    function (truth, f) { return truth && f(); },
    true
  );
}

// defined on p
function anyOf() {
  return _.reduceRight(
    arguments,
    function (truth, f) { return truth || f(); },
    false
  );
}

/** defined on p39 */
// concatenate!
function cat() {
  var head = _.first(arguments);
  if(existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

// defined on p40
function construct(head,tail) {
  return cat([head], _.toArray(tail));
}

// defined on p40
function mapcat(fn, coll) {
  return cat.apply(null, _.map(coll, fn));
}

// defined on p40
function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

// defined on p40
function interpose(inter, coll) {
  return butLast(mapcat(function(e) {
    return construct(e, [inter]);
  }, coll));
}

function compliment(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  };
}

function isEven(val) {
  return (val % 2) === 0;
}

var isOdd = compliment(isEven);

function plucker(field) {
  return function(obj) {
    return (obj && obj[field]);
  };
}

/**
 * valueFun is a fn to determine how to interpret each val in the coll.
 * bestFun compares to values, as given by valueFun.
 * e.g.: finder(_.identity, Math.max, [0,6,3,9,1,])
 * defined on p70
 */
function finder(valueFun, bestFun, coll) {
  return _.reduce(coll, function(best, current) {
    var bestValue = valueFun(best);
    var currentValue = valueFun(current);

    return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
  });
}

/**
 * Or, we can give a best-fit function if we assume the fun knows how to
 * 'unwrap' its own arguments, and i t returns true if the first arg is
 * 'better' than the second.
 * defined on p41
 */
function best(fun, coll) {
  return _.reduce(coll, function(x,y) {
    return fun(x,y) ? x : y;
  });
}

module.exports = {
  allOf: allOf,
  anyOf: anyOf,
  best: best,
  butLast: butLast,
  cat: cat,
  comparator: comparator,
  compliment: compliment,
  construct: construct,
  doWhen: doWhen,
  executeIfHasField: executeIfHasField,
  existy: existy,
  fail: fail,
  finder: finder,
  interpose: interpose,
  isEven: isEven,
  isOdd: isOdd,
  lessOrEqual: lessOrEqual,
  lessThanOrEqualSorter: lessThanOrEqualSorter,
  mapcat: mapcat,
  nth: nth,
  plucker: plucker,
  second: second,
  truthy: truthy,
  warn: warn,
};
