var asmjson = require("..");
var test = require('tape');

test('timing test', function (t) {
    t.equal(asmjson.testFunction(), 11);

    t.end()
});