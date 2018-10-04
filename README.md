Event based JSON parser in Assemblyscript
===========================

This module aims to provide json string parsing via an event driven approach similar to RapidJSON SAX mode.

Users can write a custom handler to parse json strings in to assemblyscript classes with known types

Instructions
------------

To build and run the tests:

```
$> npm install
$> npm run build:tests
$> npm run test
```
Writing a parser for a custom assemblyscript class requires defining a new class that extends `Handler` and then using this to populate the fields.

```typescript
import {parseString, Handler} from 'asmjson'

class Address {
  houseNumber: i32
  streetName: string,
  stretType: string
}

class AddressPopulator extends Handler {
  currentKey: string

  constructor(public address: Address) { }
  
  onKey(value: string): boolean {
    currentKey = value;
    return true;
  }

  onInt(value: i32, stringValue: string) {
  	if(currentKey == "house_number") {
  		this.address.houseNumber = value;
  	}
  }

  onString(value: string) {
    if(currentKey == "street_name") {
    	this.address.streetName = value;
    } else if (currentKey == "street_type") {
    	this.address.street_type = value;
    }
  }
}

let address = new Address()
let handler = new AddressPopulator(address)

jsonString = `{"house_number": 420, "street_name": "smith", "street_type": "street"}`

parseString<AddressPopulator>(jsonString, handler)

// the fields of address should now be populated
console.log(address.streetName) //smith


```

### Implementation
This parser directly implements a state machine for stream parsing JSON strings that triggers events on certain state transitions.

![Failed to load state diagram](json-parsing-state-diagram.png?raw=true "State Transition Diagram")
