// Programming Without Class pt. 2
// Sometimes classes are nice.

var _ = require('underscore'); 
var Class = require("class.extend"); // Resig's Class with #extend

var {dispatch, fail, existy, construct, invoker} = require("../src/all_fns");
var {deepClone} = require("../src/recursion");

/**
 * p198 example fn to convert an obj to a string.
 * Ok, but modifying this requires adding another if branch.
 */
function polyToStringFn(obj) {
    if (obj instanceof String)
        return obj;
    else if (obj instanceof Array)
        return stringifyArray(obj);
    else
        return obj.toString();
}

function stringifyArray(ary) {
    return ["[", _.map(ary, polyToStringFn).join(","), "]"].join('');
}


/** 
 * This one is easier to extend, but starts getting weird, especially if you need to
 * handle hierarchical types.
 */
var polyToStringDspch = dispatch(
    (s) => _.isString(s) ? s : undefined,
    (s) => _.isArray(s) ? stringifyArray(s) : undefined,
    (s) => _.isObject(s) ? JSON.stringify(s) : undefined,
    (s) => s.toString()
);

var HierarchicalCASClass = (function () {
    /** p202 Some objects */
    var ContainerClass = Class.extend({
        init(val) {
            this._value = val;
        }
    });

    class ObservedContainerClass extends ContainerClass {
        note(v) { }
        observe(f) { this.note("set observer") }
        notify() { this.note("notifying observers") }
    };

    class HoleClass extends ObservedContainerClass {
        setValue(val) {
            this._value = val;
            this.notify();
        }
    };

    /** This class adds additional compare-and-swap semantics that say, "provide what you think is the old value and a new value, and I'll set the new value only if the expected old and actual old match." This change semantic is especially nice for asynchronous programming because it provides a way to check that the old value is what you expect, and did not change. Coupling compare-and-swap with JavaScript's run-to-completion guarantees is a powerful way to ensure coherence in asynchronous change. */
    class CASClass extends HoleClass {
        swap(oldVal, newVal) {
            if (!_.isEqual(oldVal, this._value))
                fail("No match");
            else
                return this.setValue(newVal);
        }
    };

    return CASClass;
})();


// But classes are terrible for not-hierarchical relationships.

/** p206 */
function Container(val) {
    this._value = val;
    this.init(val);
};
Container.prototype.init = _.identity;

/**
 * A behavior with the following semantics:
 * Holds a value
 * Delegates to a validation function to check the value set
 * Delegates to a notification function to notify interested parties of value changes
 *
 * The mixin protocol specification for HoleMixin is as follows:
 * Extension protocol: Must provide notify, validate and init methods
 * Interface protocol: Constructor and setValue
 */
var HoleMixin = {
    getValue() {
        return this._value;
    },
    setValue(newValue) {
        var oldVal = this._value;

        this.validate(newValue);
        this._value = newValue;
        this.notify(oldVal, newValue);
        return this._value;
    }
};

/** p208 */
var ObserverMixin = (function () {
    var _watchers = [];

    return {
        watch(fun) {
            _watchers.push(fun);
            return _.size(_watchers);
        },
        notify(oldVal, newVal) {
            _.each(_watchers, function(watcher) {
                watcher.call(this, oldVal, newVal);
            });
           return _.size(_watchers);
        }
    };
}());

/** p209 */
var ValidateMixin = {
    addValidator(fun) {
        this._validator = fun;
    },
    init(val) {
        this.validate(val);
    },
    validate(val) {
        if (existy(this._validator) && !this._validator(val))
            fail("Attempted to set invalid value " + polyToStringDspch(val));
    }
};

function Hole1(val) {
    Container.call(this, val);
}
// Do the mixin!
_.extend(
    Hole1.prototype,
    HoleMixin,
    ValidateMixin,
    ObserverMixin
);


/**
 * p211
 * Take a function and some number of arguments and set the new value based on the result of a call to that function with the current value and the arguments. 
 * Extension protocol: Must provide a setValue method and a _value property
 * Interface protocol: The swap method
 */
var SwapMixin = {
    swap(fun /* , args... */) {
        var args = _.rest(arguments)
        var newValue = fun.apply(this, construct(this._value, args));
        return this.setValue(newValue);
    }
};

/** p212 */
var SnapshotMixin = {
    snapshot() {
        return deepClone(this._value);
    }
};

/**
 * p213 
 * Note -- this overrides SwapMixin's method
 */
var CASMixin = {
    swap: function(oldVal, f) {
        if (this._value === oldVal) {
            this.setValue(f(this._value));
            return this._value;
        } else {
            return undefined;
        }
    }
};

function Hole(val) {
    Container.call(this, val);
}

// Do the mixin!
_.extend(
    Hole.prototype,
    HoleMixin,
    ValidateMixin,
    ObserverMixin,
    SwapMixin,
    SnapshotMixin
);


var CAS = function(val) {
    Hole.call(this, val);
}

_.extend(
    CAS.prototype,
    HoleMixin,
    ValidateMixin,
    ObserverMixin,
    SwapMixin, // Leaving in SwapMixin in case it gains new functionality later.
    CASMixin,
    SnapshotMixin
);



/**
 * p214 Hiding object implementation in functions
 * This could be the user-facing API:
 */
function contain(value) {
    return new Container(value);
}

/** Providing the mixin extensions as functions */
function hole(val /*, validator */) {
    var h = new Hole();

    var v = _.toArray(arguments)[1];
    if (v) h.addValidator(v);

    h.setValue(val);
    return h;
}

var swap = invoker('swap', Hole.prototype.swap);

function cas(val /*, args */) {
    var h = hole.apply(this, arguments);
    var c = new CAS(val);
    c._validator = h._validator;

    return c;
}

var compareAndSwap = invoker('swap', CAS.prototype.swap);

var snapshot = (o) => o.snapshot();

var addWatcher = (o, fun) => o.watch(fun);

var containerFns = {
    contain, hole,
    swap,
    cas, compareAndSwap,
    snapshot,
    addWatcher,
}

/**
 * I believe that by putting a functional face on the container types, I've achieved a level of flexibility not obtainable via an object/method focus.
 */


module.exports = {
    CAS,
    CASMixin,
    HierarchicalCASClass,
    Hole,
    Hole1,
    HoleMixin,
    ObserverMixin,
    SnapshotMixin,
    SwapMixin,
    ValidateMixin,
    containerFns,
    polyToStringDspch,
    polyToStringFn,
}
