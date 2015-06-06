var _ = require('lodash');
var fns = require('./all_fns');
var relational = require('./sqlish-fns');
var higher = require('./fn_builders');

/** p165 */
function createPerson() {
    var firstName = "";
    var lastName = "";
    var age = -1;

    return {
        setFirstName(fname) {
            firstName = fname;
            return this;
        },
        setLastName(lname) {
            lastName = lname;
            return this;
        },
        setAge(a) {
            age = a;
            return this;
        },
        toString() {
            return `${lastName}, ${firstName} is ${age} years old.`;
        }
    }
}

/**
 * p168 - p173
 * There are other ways to enhance LazyChain, such as caching the result and providing an interface that does not rely on strings, but I leave that as an exercise for the reader.
 */
function LazyChain(obj) {
    var isLC = (obj instanceof LazyChain);

    this._calls = isLC ? fns.cat(obj._calls, []) : [];
    this._target = isLC ? obj._target : obj;
}

LazyChain.prototype.invoke = function(methodName /*, args */) {
    var args = _.rest(arguments);

    // A function that wrapps behavior for later execution is a 'thunk'.
    this._calls.push(function(target) {
        var meth = target[methodName];
        return meth.apply(target, args);
    });

    return this;
}

LazyChain.prototype.force = function() {
    return _.reduce(this._calls, function(target, thunk) {
        return thunk(target);
    }, this._target);
}

LazyChain.prototype.tap = function(fun) {
    this._calls.push(function(target) {
        fun(target);
        return target;
    });

    return this;
}

/**
* p177 aka the thrush combinator
*/
function pipeline(seed /*, args */) {
    return _.reduce(_.rest(arguments),
                    function(l,r) { return r(l) },
                   seed);
}

/** p179 A relational query language for pipelining. */
var RQL = _.mapValues(relational, higher.curry2);

/**
 * p184
 * take an array of functions, each taking a value and returning a function that augments the intermediate state object.
 */
function actions(acts, done) {
   return function(seed) {
       // reduce over all of the functions in the array and build up an intermediate state object
       var init = {values: [], state: seed};

       var intermediate = _.reduce(acts, function(stateObj, action) {
           var result = action(stateObj.state);
           var values = fns.cat(stateObj.values, [result.answer]);

           return {values, state: result.state};
       }, init);

       var keep = _.filter(intermediate.values, fns.existy);

       return done(keep, intermediate.state);
   };
}

/** p187 */
function lift(answerFun, stateFun) {
    return function(/* args */) {
        var args = _.toArray(arguments);

        return function(state) {
            var answer = answerFun.apply(null, fns.construct(state, args));
            var s = stateFun ? stateFun(state) : answer;

            return {answer, state: s};
        }
    }
}

module.exports = {
    LazyChain,
    RQL,
    actions,
    createPerson,
    lift,
    pipeline,
}
