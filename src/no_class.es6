// Programming Without Class

var _ = require('underscore');

/**
 * p192
 * This is almost the exact code as in the implementation of flow#LazyChain except for the following:
 * The lazy chain is initiated via a function call.
 * The call chain (in calls) is private data.
 * There is no explicit LazyChain type.
 */

function lazyChain(obj) {
    var calls = [];

    return {
        invoke(methodName /*, args */) {
            var args = _.rest(arguments);
            calls.push((target) => target[methodName].apply(target, args));
            return this;
        },

        force() {
            return _.reduce(calls, (ret, thunk) => thunk(ret), obj);
        }
    }
}


module.exports = {
    lazyChain,
};
