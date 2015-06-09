/**
 * Chapter 5
 * This chapter builds on the idea of first-class functions by explaining
 * how and why one builds functions on the fly. It explores various ways
 * to facilitate function "composition" - snapping together functions like
 * Lego blocks to build richer functionality from parts.
 */

var _ = require('lodash');
var intro = require('./introducing');
var fns = require('../src/fns');

var existy = intro.existy;
var construct = fns.construct;
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

/**
 * Defined p95
 */
function curry(fn) {
    return function(arg) {
        return fn(arg);
    };
}

/**
 * Defined p96
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

/**
 * Defined p98
 */
function curry3(fun) {
    return function(last) {
        return function(middle) {
            return function(first) {
                return fun(first, middle, last);
            };
        };
    };
}

/** Convert a number to hex */
function toHex(n) {
    var hex = n.toString(16);
    return (hex.length < 2) ? [0, hex].join(''): hex;
}

/** Convert an rgb set to hex */
function rgbToHexString(r, g, b) {
    return ["#", toHex(r), toHex(g), toHex(b)].join('');
}

// On General currying:
// "That JavaScript allows a variable number of arguments to functions actively works against currying in general and is often confusing."
// Partial tends to work better when dealing with varargs.

function partial1(fn, arg1) {
    return function(/* args */) {
        var args = fns.construct(arg1, arguments);
        return fn.apply(fn, args);
    };
    // or just this:
    // return fun.bind(undefined, arg1);
}

function partial2(fn, arg1, arg2) {
    return function(/* args */) {
        var args = fns.cat([arg1, arg2], _.toArray(arguments));
        return fn.apply(fn, args);
    };
    // or just this:
    // return fun.bind(undefined, arg1);
}

/**
 * defined p103
 */
function partial(fn /*, args */) {
    var pargs = _.rest(arguments);

    return function(/* args */) {
        var args = fns.cat(pargs, _.toArray(arguments));
        return fn.apply(fn, args);
    };
    // or just this:
    // fun.bind.apply(fun, construct(undefined, args))
}

/**
 * p105
 * Attach preconditions seperately from essential calculations
 */
function condition1(/* validators */) {
    var validators = _.toArray(arguments);

    return function(fun, arg) {
        var errors = fns.mapcat(function(isValid) {
            return isValid(arg) ? [] : [isValid.message];
        }, validators);

        if (!_.isEmpty(errors))
            throw new Error(errors.join(", "));

        return fun(arg);
    };
}

module.exports = {
    condition1: condition1,
    curry2: curry2,
    curry3: curry3,
    curry: curry,
    dispatch: dispatch,
    partial1: partial1,
    partial2: partial2,
    partial: partial,
    rgbToHexString: rgbToHexString,
};
