## Documentation

You can see below the API reference of this module.

### `converter(data, opts)`
Converter
Converts the data using synchronous and asynchronous functions.

#### Params

- **Object** `data`: The data object.
- **Object** `opts`: The options object:
 - `autostart` (Boolean): If `true`, the functions will be executed,
   without calling the `start()` method.

#### Return
- **Number** Return description.

### `add(fn, type)`
Adds a new function.

There are three levels where the functions are added to be executed:

```
Parallel:               | <0: [.............................................]>
Unordered (don't wait): |                                <4a: [........]>
                        +                                <4b: [....]>
                        +                                <4c: [......]>
Ordered (wait):         | <1: [...]> <2: [.]> <3:[.....]>                <5: [....]>
```

#### Params

- **Function|FunctionDataConverter** `fn`: The function to add. Note you can add an existing converter instance as well.
- **ConverterType** `type`: One of the following:
   - `Converter.PARALLEL`: Used to append on the parallel timeline.
   - `Converter.UNORDERED`: Grouped, but unordered.
   - `Converter.ORDERED`: Grouped, but ordered.

#### Return
- **FunctionDataConverter** The current Converter instance.

### `start(data, fn)`
Starts the function execution.

#### Params

- **Object** `data`: The data object.
- **Function** `fn`: The callback function.

