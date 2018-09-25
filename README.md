Event based JSON parser in Assemblyscript
===========================

This module aims to provide json string parsing via an event driven approach similar to RapidJSON SAX mode.

Users can write a custom handler to parse json strings in to assemblyscript classes with known types

Instructions
------------

To build to an untouched and an optimized `.wasm` including their respective `.wat` representations, run:

```
$> npm run asbuild
```

Afterwards, to run the included [test](./tests/index.js):

```
$> npm install
$> npm test
```
