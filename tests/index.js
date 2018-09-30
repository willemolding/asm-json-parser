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


// Run all the functions that start with test that are exported from the wasm code
Object.keys(ins.exports).forEach((key) => {
    if(key.startsWith('test')) {
        // console.log(key);
        test(key, function (t) {
            t.equal(ins.exports[key](), 0);
            t.end()
        });
    }
});


