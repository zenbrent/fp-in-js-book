/**
 * Chapter 7, p139
 *
 * 3 rules for purity (from p141)
 *   Its result is calculated only from the values of its arguments.
 *   It cannot rely on data that changes external to its control.
 *   It cannot change the state of something external to its body.
 *
 * p141
 * Depending on the consistency of variables "is especially nasty in
 * JavaScript because of its ability to load arbi‐ trary code at
 * runtime that can easily change objects and variables. Therefore,
 * to write functions that rely on data outside of its control is a
 * recipe for confusion. Typically, when you attempt to test functions
 * that rely on the vagaries of external conditions, all test cases
 * must set up those same conditions for the very purpose of testing."
 */

var builders = require('./fn_builders');
var _ = require('lodash');


/** p139 */
var rand = builders.partial1(_.random, 1);

/**
 * p142
 * rand is impure, but we can seperate the pure from impure parts
 * for better testability and clarity.
 */
function generateRandomCharacter() {
  return rand(26).toString(36);
}

function generateString(charGen, len) {
  return repeatedly(len, charGen).join('');
}

function randomString(len) {
  return generateString(generateRandomCharacter, len);
}


module.exports = {
  generateRandomCharacter: generateRandomCharacter,
  generateString: generateString,
  rand: rand,
};
