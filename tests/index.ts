import { parseString, Handler } from '../lib/asmjson'

class TestHandler extends Handler {
  events: Array<string> = []

  onObjectStart(): boolean {
    this.events.push("OS")
    return true
  }
}




export function test_parse_empty_object(): i32 {

  var testHandler = new TestHandler()

  parseString<TestHandler>("{}", testHandler)
  return testHandler.events[0] == "OS" ? 0 : -1
}