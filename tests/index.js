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

test('Can import the module and call a function', function (t) {
    t.equal(ins.exports.test_import(), 0);
    t.end()
});