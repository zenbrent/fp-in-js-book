/**
 * The reules of self-recursion:
 * - Know when to stop
 * - Decide how to take one step
 * - Break the problem into that step and a smaller problem
 */

var fn = require('./all_fns');
var _ = require('lodash');

function recurseLength(ary) {
    if (_.isEmpty(ary))
        return 0;
    else
        return 1 + recurseLength(_.rest(ary));
}

function cycle(times, ary) {
    if (times <= 0)
        return [];
    else
        return fn.cat(ary, cycle(times - 1, ary));
}


/**
 * Part of the solution to reversing _.zip
 * In other words, first build the code for a single step.
 * THEN recurse.
 */
function constructPair(pair, rests) {
    return [fn.construct(_.first(pair), _.first(rests)),
        fn.construct(fn.second(pair), fn.second(rests))];
}

/** p117 */
function unzip(pairs) {
    if (_.isEmpty(pairs)) return [[], []];

    return constructPair(
        _.first(pairs),
        unzip(_.rest(pairs))
    );
}

/**
 * One step in recursive, depth-first tree walker:
 * Given one item in a tree, find the next items to walk to.
 * p119
 * TODO: Make it take and walk multiple nodes.
 */
function nexts(graph, node) {
    // Empty graph. We're done.
    if (_.isEmpty(graph)) return [];

    var pair = _.first(graph);
    var from = _.first(pair);
    var to = fn.second(pair);
    var more = _.rest(graph);

    if (_.isEqual(node, from))
        // If from equals node, i.e. this node starts from the node we are looking at,
        // add it to a list of the rest of the matching nodes.
        return fn.construct(to, nexts(more, node));
        else
            // Recurse, ignore the current node. It is not the node we are looking for.
            return nexts(more, node);

}

/**
 * depth first recursive search with memory
 * Use an accumulator to avoid revisiting nodes.
 * p120
 */

function depthSearch(graph, nodes, seen) {
    if(_.isEmpty(nodes)) return fn.rev(seen);

    var node = _.first(nodes);
    var more = _.rest(nodes);

    if(_.contains(seen, node))
        return depthSearch(graph, more, seen);
    else
        return depthSearch(
            graph,
            fn.cat(nexts(graph, node), more),
            fn.construct(node, seen)
        );
}

/** p122 */
// TODO: A short-circuiting andify function can also be implemented via Underscore’s every function. 
function andify(/* preds */) {
    var preds = _.toArray(arguments);

    return function(/* args */) {
        var args = _.toArray(arguments);

        var everything = function(ps, truth) {
            if (_.isEmpty(ps))
                return truth;
            else
                // N.B. this does lazily continue -- short-circuiting with &&
                return _.every(args, _.first(ps)) && everything(_.rest(ps), truth);
        };

        return everything(preds, true);
    };
}

/** p123 */
// TODO: A short-circuiting andify function can also be implemented via Underscore’s some function. 
function orify(/* preds */) {
    var preds = _.toArray(arguments);

    return function(/* args */) {
        var args = _.toArray(arguments);

        var something = function(ps, truth) {
            if (_.isEmpty(ps))
                return truth;
            else
                return _.some(args, _.first(ps)) || something(_.rest(ps), truth);
        };

        return something(preds, false);
    };
}

/** p124 */

function even(n) {
    if (n === 0)
        return true;
    else
        return odd(Math.abs(n) - 1);
}

function odd(n) {
    if (n === 0)
        return false;
    else
        return even(Math.abs(n) - 1);
}

/** p125 Use mutual recursion with map */
function flat(array) {
    if (_.isArray(array))
        return fn.cat.apply(fn.cat, _.map(array, flat));
    else
        return [array];
}

/** p126 */
function deepClone(obj) {
    if (!fn.existy(obj) || !_.isObject(obj))
        return obj;

    var temp = new obj.constructor();
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            temp[key] = deepClone(obj[key]);

    return temp;
}

/** p126 */
function visit(mapFun, resultFun, array) {
    if (_.isArray(array))
        return resultFun(_.map(array, mapFun));
    else
        return resultFun(array);
}

/**
 * p127
 * Mutually recursive version of depthSearch.
 * Calls mapFun before expanding element's children.
 * Note - the function that JSON.parse takes works similarly to this. Great
 *   for parsing dates in json!
 */
function postDepth(fun, ary) {
    return visit(fn.partial1(postDepth, fun), fun, ary);
}

/** Calls mapFun after expanding element's children.  */
function preDepth(fun, ary) {
    return visit(fn.partial1(preDepth, fun), fun, fun(ary));
}

/**
 * p128
 * Go through a list of languages and pick out the ones that were
 * influenced by lang.
 */
function influencedWithStrategy(strategy, lang, graph) {
    var results = [];

    strategy(function(x) {
        if (_.isArray(x) && _.first(x) === lang)
            results.push(fn.second(x));

        return x;
    }, graph);

    return results;
}

/**
 * p129
 * Even and odd mutually recursive functions, with trampolining
 */
function evenOline(n) {
    if (n === 0)
        return true;
    else
        return fn.partial1(oddOline, Math.abs(n) - 1);
}

function oddOline(n) {
    if (n === 0)
        return false;
    else
        return fn.partial1(evenOline, Math.abs(n) - 1);
}

/**
 * p130 Automatic trampoline
 * This can be added right into the even and odd functions.
 */
function trampoline(fun /*, args */) {
    var result = fun.apply(fun, _.rest(arguments));

    while (_.isFunction(result)) {
        result = result();
    }

    return result;
}

/**
 * p132 Generators!
 * Head, seed, and tail function.
 */
function generator(seed, current, step) {
}


module.exports = {
    andify: andify,
    constructPair: constructPair,
    cycle: cycle,
    deepClone: deepClone,
    depthSearch: depthSearch,
    even: even,
    evenOline: evenOline,
    flat: flat,
    generator: generator,
    influencedWithStrategy: influencedWithStrategy,
    nexts: nexts,
    orify: orify,
    postDepth: postDepth,
    preDepth: preDepth,
    recurseLength: recurseLength,
    trampoline: trampoline,
    unzip: unzip,
    visit: visit,
};
