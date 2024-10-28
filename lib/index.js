"use strict";

const EventEmitter = require("events").EventEmitter
    , ul = require("ul")
    , deffy = require("deffy")
    , typpy = require("typpy")
    , noop = require("noop6")
    , asyncer = require("asyncer.js")
    , fnResult = require("fn-result")
    ;

class FunctionDataConverter extends EventEmitter {

    /**
     * Converter
     * Converts the data using synchronous and asynchronous functions.
     *
     * @name converter
     * @function
     * @param {Object} data The data object.
     * @param {Object} opts The options object:
     *
     *  - `autostart` (Boolean): If `true`, the functions will be executed,
     *    without calling the `start()` method.
     *
     * @return {Number} Return description.
     */
    constructor (data, opts) {

        super();

        this._originalData = data;

        this._cUnordered = [];
        this._lastFn = {};

        this._asyncerTasks = [
            this._parallel = []
          , this._ordered = []
        ];


        opts = ul.merge(opts, {
            autostart: true
        });

        this.autostart = opts.autostart;
        process.nextTick(() => {
            this.autostart && this.start()
        });
    }

    _wrapFn (fn) {
        return cb => {
            fnResult(fn, [this._originalData], cb);
        };
    }

    /**
     * add
     * Adds a new function.
     *
     * There are three levels where the functions are added to be executed:
     *
     * ```
     * Parallel:               | <0: [.............................................]>
     * Unordered (don't wait): |                                <4a: [........]>
     *                         +                                <4b: [....]>
     *                         +                                <4c: [......]>
     * Ordered (wait):         | <1: [...]> <2: [.]> <3:[.....]>                <5: [....]>
     * ```
     *
     * @name add
     * @function
     * @param {Function|FunctionDataConverter} fn The function to add. Note you can add
     * an existing converter instance as well.
     * @param {ConverterType} type One of the following:
     *
     *    - `Converter.PARALLEL`: Used to append on the parallel timeline.
     *    - `Converter.UNORDERED`: Grouped, but unordered.
     *    - `Converter.ORDERED`: Grouped, but ordered.
     *
     * @return {FunctionDataConverter} The current Converter instance.
     *
     */
    add (fn, type) {

        if (typeof type === "string") {
            type = FunctionDataConverter[type];
            if (typeof type !== "number") {
                throw new Error("Invalid type.");
            }
        }

        if (typpy(fn, Array)) {
            fn.forEach(c => this.add(c, type));
            return this;
        }

        type = deffy(type, FunctionDataConverter.ORDERED);
        if (typpy(fn, FunctionDataConverter)) {
            let tr = fn;
            tr.autostart = false;
            fn = (data, cb) => {
                tr.start(data, cb);
            };
        }

        fn = this._wrapFn(fn);

        switch (type) {
            case FunctionDataConverter.PARALLEL:
                this._parallel.push(fn);
                break;
            case FunctionDataConverter.UNORDERED:
                if (this._lastFn.type !== FunctionDataConverter.UNORDERED) {
                    this._cUnordered = [];
                    this._ordered.push({
                        parallel: this._cUnordered
                    });
                }
                this._cUnordered.push(fn);
                break;
            case FunctionDataConverter.ORDERED:
                this._ordered.push(fn);
                break;
        }

        this._lastFn = {
            fn: fn
          , type: type
        };

        this._ordered.push();
        return this;
    }

    /**
     * start
     * Starts the function execution.
     *
     * @name start
     * @function
     * @param {Object} data The data object.
     * @param {Function} fn The callback function.
     */
    start (data, fn) {

        if (fn) {
            this._originalData = data;
        } else {
            fn = data;
        }

        fn = fn || noop;
        asyncer(this._asyncerTasks, err => {
            this.emit("end", err, this._originalData);
            fn(err, this._originalData);
        });
    }
}

FunctionDataConverter.PARALLEL = 1;
FunctionDataConverter.UNORDERED = 2;
FunctionDataConverter.ORDERED = 3;

module.exports = FunctionDataConverter;
