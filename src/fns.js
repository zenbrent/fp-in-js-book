/**
 * This file still needs to be split up by chapter.
 */

_ = require('lodash');

var intro = require('./introducing');
var existy = intro.existy;

// defined on p36
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

/**
 * defined p72
 */
function repeat(times, value) {
  return _.map(_.range(times), function() { return value; });
}

/**
 * Even better - use a funciton, not a value.
 * defined p73
 */
function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

/**
 * Even BETTER! Use a fn for the iterator.
 * Defined p74
 */
function iterateUntil(fun, check, init) {
  var ret = [],
      result = fun(init);

  while (check(result)) {
    ret.push(result);
    result = fun(result);
  }

  return ret;
}

/**
 * Sometimes also called k
 * This is an instance of a 'combinator'
 * defined p76
 */
function always(val) {
  return function() { return val; };
}

/**
 * Take a method name and return a function that will call that method
 * on any given object. The method must be the same -- e.g.
 * var str = invoker('toString', Array::toString)
 * str(['asdf','qwer']) //=> "asfd,qwer"
 * str('asdf') //=> undefined
 * defined p76
 */
function invoker(name, method) {
  return function(target /* args... */) {
    if (!existy(target)) intro.fail("Must provide a target");

    var targetMethod = target[name],
        args = _.rest(arguments);

    return intro.doWhen(
      (existy(targetMethod) && (method === targetMethod)),
      function() {
        return targetMethod.apply(target, args);
      }
    );
  };
}

/** p76 */
var rev = invoker('reverse', Array.prototype.reverse);

/** defined p77 */
function uniqueString(length) {
  return Math.random().toString(36).substr(2, length);
}

/**
 * Given a function and defaults, return a new function that takes a list
 * and calls the given fn for every item that is existy.
 * defined p80
 */
function fnull(fn /*, defaults */) {
  var defaults = _.rest(arguments);

  return function(/*args*/) {
    // Should this map over arguments or defaults? This doesn't
    // gaurantee anything if the arguments are just not passed in.
    // e.g.:
    // safeMult = fnull(((total, n) -> total * n), 1, 1)
    // safeMult() //> undefined
    // I would expect 1.
    var args = _.map(arguments, function(e, i) {
      return existy(e) ? e : defaults[i];
    });

    return fn.apply(null, args);
  };
}

/**
 * Create a function that will give a value from an object, or
 * give the default value provided.
 */
function defaults(d) {
  return function(o, k) {
    var val = fnull(_.identity, d[k]);
    return o && val(o[k]);
  };
}

/**
 * Something to validate objects!
 * Take a list of validators and return a function to check an object against them.
 * defined p82
 */
function checker(/* validators */) {
  var validators = _.toArray(arguments);

  return function(obj) {
    return _.reduce(validators, function(errs, check) {
      if (check(obj))
        return errs;
      else
        // _.chain is to avoid:
        // errs.push(check.message);
        // return errs;
        // don't know if I like.
        // "The use of _.chain definitely requires more characters, but it hides the array mutation nicely."
        return _.chain(errs).push(check.message).value();
    }, []);
  };
}

/**
 * Create a validator.
 * defined p83
 */
function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

/**
 * Check to see if an object has some keys
 * defined p84
 */
function hasKeys() {
  var keys = _.toArray(arguments);

  var fun = function(obj) {
    return _.every(keys, function(k) {
      return _.has(obj, k);
    });
  };

  fun.message = cat(["Must have values for keys:"], keys).join(' ');
  return fun;
}

module.exports = {
  allOf: allOf,
  always: always,
  anyOf: anyOf,
  best: best,
  butLast: butLast,
  cat: cat,
  checker: checker,
  compliment: compliment,
  construct: construct,
  defaults: defaults,
  finder: finder,
  fnull: fnull,
  hasKeys: hasKeys,
  interpose: interpose,
  invoker: invoker,
  isEven: isEven,
  isOdd: isOdd,
  iterateUntil: iterateUntil,
  mapcat: mapcat,
  plucker: plucker,
  repeat: repeat,
  repeatedly: repeatedly,
  rev: rev,
  uniqueString: uniqueString,
  validator: validator,
};
