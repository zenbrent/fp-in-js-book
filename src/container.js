// p162
// Purity, Immutability, and Policies for Change

var _ = require('lodash');
var fns = require('../src/all_fns');

// So... why isn't this immutable? and why the constructor?
function Container (init) {
    this._value = init;
}

Container.prototype = {
    update: function(fun /*, args */) {
        var args = _.rest(arguments);
        var oldValue = this._value;

        this._value = fun.apply(this, fns.construct(oldValue, args));

        return this._value;
    }
}

function ImmutableContainer (init) {
    var newCont = Object.create(ImmutableContainer.prototype)
    newCont._value = init;
    return newCont;
}

ImmutableContainer.prototype = {
    update: function(fun /*, args */) {
        var args = _.rest(arguments);
        return ImmutableContainer(fun.apply(this, fns.construct(this._value, args)));
    },

    value: function() {
        return this._value;
    }
}

module.exports = {
    Container: Container,
    ImmutableContainer: ImmutableContainer
}
