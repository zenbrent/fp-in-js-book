/**
 * Chapter 5
 * This chapter builds on the idea of first-class functions by explaining
 * how and why one builds functions on the fly. It explores various ways
 * to facilitate function "composition" - snapping together functions like
 * Lego blocks to build richer functionality from parts.
 */

_ = require('lodash');
var intro = require('./introducing');
var fns = require('../src/fns');

var existy = intro.existy;
// var fail = intro.fail;

/**
 * Take a series of functions (invokers can work well), and return a function
 * that will run each function against an object until one returns an
 * existy value. The new function returns that existy value.
 * Polymorphic phunctions FTW.
 * Defined p87
 */
function dispatch(/* functions */) {
  var funs = _.toArray(arguments);
  var size = funs.length;

  return function(target /*, args */) {
    var ret;
    var args = _.rest(arguments);

    for (var funIndex = 0; funIndex < size; funIndex++) {
      var fun = funs[funIndex];
      ret = fun.apply(fun, fns.construct(target, args));

      if (existy(ret)) return ret;
    }
    return ret;
  };
}

function curry(fn) {
  return function(arg) {
    return fn(arg);
  };
}

/**
 * Currying right so you can use currying to configure functions.
 * The main argument in JS is usually the left, the "specialization"
 * arguments are on the right, e.g. the number and radix in parseInt.
 */
function curry2(fn) {
  return function(arg2) {
    return function(arg1) {
      return fn(arg1, arg2);
    };
  };
}



module.exports = {
  curry2: curry2,
  curry: curry,
  dispatch: dispatch,
};
