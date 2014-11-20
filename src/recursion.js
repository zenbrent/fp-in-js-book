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
function andify() {}
/** p123 */
function orify() {}


module.exports = {
  andify: andify,
  constructPair: constructPair,
  cycle: cycle,
  depthSearch: depthSearch,
  nexts: nexts,
  orify: orify,
  recurseLength: recurseLength,
  unzip: unzip,
};
