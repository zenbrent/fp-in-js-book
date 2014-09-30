_ = require('lodash');


// defined on p12
function isIndexed(data) {
  return _.isArray(data) || _.isString(data);
}

// defined p12
function nth(a, index) {
  if (!_.isNumber(index)) fail("Expected a number as the index");
  if (!isIndexed(a)) fail("Not supported on non-indexed type");
  if ((index < 0) || (index > a.length - 1))
    fail("Index value is out of bounds"); return a[index];
}

function second(a) {
  return nth(2, a);
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
  }
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

// defined on p
function doWhen(cond, action) {
  if(truthy(cond))
    return action();
  else
    return undefined;
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

// defined on p
function cat() {
  var head = _.first(arguments)
  if(existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

// defined on p
function construct(tail,head) {
  return cat([head], _.toArray(tail));
}

// defined on p
function mapcat(fn, coll) {
  return cat.apply(null, _.map(coll), fn);
}

// defined on p
function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

// defined on p
function interpolate(fn, coll) {
  return mapcat(fn, butLast);
}

module.exports = {
  interpolate: interpolate,
  lessThanOrEqualSorter: lessThanOrEqualSorter,
  comparator: comparator,
  existy: existy,
  truthy: truthy,
  doWhen: doWhen,
  allOf: allOf,
  anyOf: anyOf,
  cat: cat,
  construct: construct,
  mapcat: mapcat
}

