var _ = require('lodash');
var fns = require('./fns');

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
    this._calls.push(function (target) {
        var meth = target[methodName];
        return meth.apply(target, args);
    });

    return this;
}

LazyChain.prototype.force = function() {
    return _.reduce(this._calls, function (target, thunk) {
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


module.exports = {
    LazyChain,
    createPerson,
}
