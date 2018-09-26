import { parseString, Handler } from '../lib/asmjson'

class TestHandler extends Handler {
  events: Array<string> = []

  onObjectStart(): boolean {
    this.events.push("OS")
    return true
  }
  onObjectEnd(): boolean {
    this.events.push("OE")
    return true
  }
  onKey(value: string): boolean {
   this.events.push("key:"+value)
   return true
  }
  onString(value: string): boolean {
   this.events.push("string:"+value)
   return true
  }
}

function test_parser(jsonString: string, expected: Array<string>): i32 {
  var testHandler = new TestHandler()
  parseString<TestHandler>(jsonString, testHandler)

  // the correct number of events were triggered
  if(expected.length != testHandler.events.length) {
    return -1 // code for wrong length
  }
  // the events are correct and in order
  for(var i = 0 ; i < expected.length; ++i) {
    if(expected[i] != testHandler.events[i]) {
      return i+1 // returns position where events fail to match using 1-based indexing
    }
  }
  return 0 // code for success
}


/*----------  The actual tests  ----------*/


export function test_parse_empty_object(): i32 {
  return test_parser(`{}`, ["OS", "OE"])
}

export function test_parse_single_string_property(): i32 {
  return test_parser(`{"aKey":"aString"}`, ["OS","key:aKey","string:aString", "OE"])
}