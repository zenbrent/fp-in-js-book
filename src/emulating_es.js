/**
 * This is from chapter 3, Variables and Closures.
 * A lot of interesting things about emulating certian js scoping features
 * in JS without using said features.
 */

var _ = require('lodash'),
    fns = require('./fns');

/**
 * Simulating a naîve, dynamic scoping mechanism
 * defined p51
 */

var globals = {};

function makeBindFun(resolver) {
    return function(k, v) {
        var stack = globals[k] || [];
        globals[k] = resolver(stack, v);
        return globals;
    };
}

/**
 * Policies for adding bindings to the globals variable:
 * p51 - p52
 */

/**
 * Take a key and value and push onto the global bindings map at the slot
 * specified by the key
 */
var stackBinder = makeBindFun(function(stack, v) {
    stack.push(v);
    return stack;
});

/**
 * Pops the last value binding off the stack associated with a name.
 */
var stackUnbinder = makeBindFun(function(stack) {
    stack.pop();
    return stack;
});

/**
 * Look up bound values:
 */
var dynamicLookup = function(k) {
    var slot = globals[k] || [];
    return _.last(slot);
};

/**
 * Encapsulate data in a function.
 */
var pingpong = (function (){
    var privateVal = 0;

    return {
        inc: function (n) {
            return privateVal += n;
        },
        dec: function (n) {
            return privateVal -= n;
        }
    }
})()

module.exports = {
    globals: globals,
    stackBinder: stackBinder,
    stackUnbinder: stackUnbinder,
    dynamicLookup: dynamicLookup,
    pingpong: pingpong,
};


