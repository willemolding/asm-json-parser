import { parseString, Handler } from '../lib/asmjson'


/*----------  The actual tests  ----------*/


export function test_parse_empty_object(): i32 {
  return test_parser(`{}`, ["OS", "OE"])
}

export function test_parse_empty_object_with_whitespace(): i32 {
  return test_parser(`    {    }   `, ["OS", "OE"])
}

export function test_parse_single_string_property(): i32 {
  return test_parser(`{"aKey":"aString"}`, ["OS","key(aKey)","string(aString)", "OE"])
}

export function test_parse_single_string_property_with_whitespace(): i32 {
  return test_parser(`    {   "aKey"   :  "aString"   }   `, ["OS","key(aKey)","string(aString)", "OE"])
}

export function test_parse_multi_string_properties(): i32 {
  return test_parser(`{"aKey":"aString", "aKey2":"aString2"}`, ["OS","key(aKey)","string(aString)","key(aKey2)","string(aString2)", "OE"])
}

export function test_parse_boolean_properties(): i32 {
  return test_parser(`{"trueKey":true, "falseKey": false}`, ["OS","key(trueKey)","bool(true)", "key(falseKey)","bool(false)", "OE"])
}


/*----------  Test running boilerplate  ----------*/


class TestHandler extends Handler {
  events: Array<string> = new Array<string>(0)

  onObjectStart(): boolean {
    this.events.push("OS")
    return true;
  }
  onObjectEnd(): boolean {
    this.events.push("OE")
    return true;
  }
  onKey(value: string): boolean {
   this.events.push("key("+value+")")
   return true;
  }
  onString(value: string): boolean {
   this.events.push("string("+value+")")
   return true;
  }
  onBool(value: boolean): boolean {
    if(value == true) {
      this.events.push("bool(true)")
    } else {
      this.events.push("bool(false)")
    }
    return true;
  }
}


function test_parser(jsonString: string, expected: Array<string>): i32 {
  let testHandler = new TestHandler()
  parseString<TestHandler>(jsonString, testHandler)

  // the correct number of events were triggered
  if(expected.length != testHandler.events.length) {
    return -1 // code for wrong length
  }
  // the events are correct and in order
  for(let i = 0 ; i < expected.length; ++i) {
    if(expected[i] != testHandler.events[i]) {
      return i+1 // returns position where events fail to match using 1-based indexing
    }
  }

  // possibly free some memory here

  return 0;
}