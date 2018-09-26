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

export function test_parse_null_property(): i32 {
  return test_parser(`{"nullKey":null}`, ["OS","key(nullKey)","null", "OE"])
}

export function test_parse_simple_int(): i32 {
  return test_parser(`{"numberKey" : 33}`, ["OS","key(numberKey)","int(33)", "OE"])
}

export function test_parse_simple_float(): i32 {
  return test_parser(`{"numberKey" : 1.5}`, ["OS","key(numberKey)","float(1.5)", "OE"])
}


export function test_different_types(): i32 {
  return test_parser(`{"intKey" : 9999, "floatKey" : 1.5, "boolKey": true, "nullKey": null, "stringKey": "123abc"}`, 
    ["OS",
    "key(intKey)","int(9999)",
    "key(floatKey)","float(1.5)",
    "key(boolKey)","bool(true)",
    "key(nullKey)","null", 
    "key(stringKey)","string(123abc)", 
    "OE"])
}


export function test_parse_simple_nested_object(): i32 {
  return test_parser(`{"objectKey" : {"stringKey": "aString" } }`, ["OS","key(objectKey)","OS", "key(stringKey)", "string(aString)", "OE", "OE"])
}

export function test_parse_more_complex_nested_object(): i32 {
  return test_parser(`{"objectKey" : {"stringKey": "aString", "objectKey2": {"nullKey": null} } }`, 
    ["OS","key(objectKey)",
      "OS", "key(stringKey)", "string(aString)", "key(objectKey2)", 
        "OS",  "key(nullKey)", "null",
        "OE",
      "OE",
     "OE"])
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
  onNull(): boolean {
    this.events.push("null")
    return true;
  }
  onInt(value: i32, stringValue: string): boolean {
    this.events.push("int("+stringValue+")");
    return true;
  }
  onFloat(value: f64, stringValue: string): boolean {
    this.events.push("float("+stringValue+")");
    return true; 
  }
}


function test_parser(jsonString: string, expected: Array<string>): i32 {
  let testHandler = new TestHandler()
  parseString<TestHandler>(jsonString, testHandler)

  // the correct number of events were triggered
  if(expected.length != testHandler.events.length) {
    // return -1 // code for wrong length
    return testHandler.events.length
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