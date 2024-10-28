"use strict";

const FunctionDataConverter = require("../lib");

let t = new FunctionDataConverter({ world: "Earth" });


// There are three levels where the functions are added to be executed:
//
// Parallel:               | <0: [.............................................]>
// Unordered (don't wait): |                                <4a: [........]>
//                         +                                <4b: [....]>
//                         +                                <4c: [......]>
// Ordered (wait):         | <1: [...]> <2: [.]> <3:[.....]>                <5: [....]>

// This will run in parallel with all the other functions
t.add((data, cb) => {
    setTimeout(() => {
        data.parallel = 42;
        cb();
    }, 2000);
}, FunctionDataConverter.PARALLEL);

// Async function, but ordered
t.add((data, cb) => {
    setTimeout(() => {
        data.oldWorld = data.world;
        data.world = "Mars";
        cb();
    }, 1000);
});

// Another async function and ordered
t.add((data, cb) => {
    setTimeout(() => {
        data.baz = 7;
        cb();
    }, 500);
});

// Async function, but not ordered
t.add((data, cb) => {
    setTimeout(() => {
        data.foo = 42;
        cb();
    }, 1000);
}, FunctionDataConverter.UNORDERED);

// Another unordered function (this will end sooner)
t.add((data, cb) => {
    setTimeout(() => {
        data.bar = 42;
        cb(null, data);
    }, 900);
}, FunctionDataConverter.UNORDERED);

// Sync function
t.add(data => {
    data.planet = data.world;
});

// Finally show the data
t.on("end", (err, data) => console.log(data));
// => { world: 'Mars'
//    , parallel: 42
//    , oldWorld: 'Earth'
//    , baz: 7
//    , bar: 42
//    , foo: 42
//    , planet: 'Mars' }