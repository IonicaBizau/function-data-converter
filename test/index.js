"use strict";

const tester = require("tester")
    , FunctionDataConverter = require("..")
    ;

tester.describe("converter", test => {
    test.should("convert data using synchronous and asynchronous functions.", cb => {
        let t = new FunctionDataConverter({ world: "Earth" });

        t.add((data, cb) => {
            setTimeout(() => {
                data.parallel = 42;
                cb();
            }, 20);
        }, FunctionDataConverter.PARALLEL);

        // Async function, but ordered
        t.add((data, cb) => {
            setTimeout(() => {
                data.oldWorld = data.world;
                data.world = "Mars";
                cb();
            }, 10);
        });

        // Another async function and ordered
        t.add((data, cb) => {
            setTimeout(() => {
                data.baz = 7;
                cb();
            }, 5);
        });

        // Async function, but not ordered
        t.add((data, cb) => {
            setTimeout(() => {
                data.foo = 42;
                cb();
            }, 10);
        }, FunctionDataConverter.UNORDERED);

        // Another unordered function (this will end sooner)
        t.add((data, cb) => {
            setTimeout(() => {
                data.bar = 42;
                cb(null, data);
            }, 9);
        }, FunctionDataConverter.UNORDERED);

        // Sync function
        t.add(data => {
            data.planet = data.world;
        });

        // Finally show the data
        t.on("end", (err, data) => {
            test.expect(data).toEqual({
                world: "Mars"
              , parallel: 42
              , oldWorld: "Earth"
              , baz: 7
              , bar: 42
              , foo: 42
              , planet: "Mars"
            });
            cb();
        });
    });

    test.it("concat converters", cb => {
        let t = new FunctionDataConverter({ world: "Earth" });
        let t1 = new FunctionDataConverter();
        let t2 = new FunctionDataConverter();
        let t3 = new FunctionDataConverter();
        let t4 = new FunctionDataConverter();

        t.add((data, cb) => {
            test.expect(data.world, "Earth");
            setTimeout(() => {
                data.parallel = 42;
                cb();
            }, 20);
        }, FunctionDataConverter.PARALLEL);

        // Async function, but ordered
        t.add(t1);
        t.add([t2, t3, t4]);

        // Another async function and ordered
        t1.add((data, cb) => {
            setTimeout(() => {
                data.baz = 7;
                cb();
            }, 5);
        });

        // Async function, but not ordered
        t2.add((data, cb) => {
            setTimeout(() => {
                data.foo = 42;
                cb();
            }, 10);
        }, FunctionDataConverter.UNORDERED);

        // Another unordered function (this will end sooner)
        t3.add((data, cb) => {
            setTimeout(() => {
                data.bar = 42;
                cb(null, data);
            }, 9);
        }, FunctionDataConverter.UNORDERED);

        // Sync function
        t2.add(data => {
            data.planet = data.world;
        });

        // Finally show the data
        t.on("end", (err, data) => {
            test.expect(data).toEqual({
                world: "Earth"
              , parallel: 42
              , baz: 7
              , bar: 42
              , foo: 42
              , planet: "Earth"
            });
            cb();
        });
    });
});
