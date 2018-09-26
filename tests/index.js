var test = require('tape');
var fs = require("fs");


// Instantiate the module
var mod = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/untouched.wasm"));
var ins = new WebAssembly.Instance(mod, {
  env: {
    memory: new WebAssembly.Memory({ initial: 1 }),
    abort: function() { throw Error("abort called"); }
  }
});


// the tape tests


test('Can parse an empty object', function (t) {
    t.equal(ins.exports.test_parse_empty_object(), 0);
    t.end()
});

test('Can parse an empty object with whitespace', function (t) {
    t.equal(ins.exports.test_parse_empty_object_with_whitespace(), 0);
    t.end()
});

test('Can parse an object with a single string property', function (t) {
    t.equal(ins.exports.test_parse_single_string_property(), 0);
    t.end()
});

test('Can parse an object with a single string property and whitespace', function (t) {
    t.equal(ins.exports.test_parse_single_string_property_with_whitespace(), 0);
    t.end()
});

test('Can parse an object with multiple string properties', function (t) {
    t.equal(ins.exports.test_parse_multi_string_properties(), 0);
    t.end()
});
