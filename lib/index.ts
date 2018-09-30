import "allocator/tlsf";

// These functions should be provided to this module via the import and used to customize the parser

// max number of nested objects
const MAX_DEPTH: i32 = 10;

@unmanaged
export class Handler {

	onKey(keyStack: Array<string>, value: string): void {}

	onObjectStart(keyStack: Array<string>): void {}
	onObjectEnd(keyStack: Array<string>): void {}

	onArrayStart(keyStack: Array<string>): void {}
	onArrayEnd(keyStack: Array<string>): void {}
	onNull(keyStack: Array<string>): void {}
	onBool(keyStack: Array<string>, value: boolean): void {}
	onString(keyStack: Array<string>, value: string): void {}
	onInt(keyStack: Array<string>, value: i32, stringValue: string): void {}
	onFloat(keyStack: Array<string>, value: f64, stringValue: string): void {}
}



const whitespace: Array<string> = [" ", "\t", "\n", "\r"];
const numeric: Array<string> = ["-",".","0","1","2","3","4","5","6","7","8","9"];

/*----------  State Variables  ----------*/


enum State {
	Start = 0,
	ObjectInitial = 1,
	MemberKey = 2,
	PostKey = 3,
	PostDelimiter = 4,
	PostMember = 6,
	PostMemberDelimiter = 7,

	ValueString = 5,
	ValueBool = 9,
	ValueNull = 10,
	ValueNumber = 11
}


var state: State;
var i: i32;
var stringBuffer: String;
var keyStack: Array<string>;

/*----------  State Functions  ----------*/

function start<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `{`) {
		state = State.ObjectInitial;
		handler.onObjectStart(keyStack);
	} else if (c == `}`) {
		handler.onObjectEnd(keyStack);
	} else if (c == `,`) {
		state = State.PostMemberDelimiter;
	}
}

function objectInitial<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `}`) {
		state = State.Start;
		handler.onObjectEnd(keyStack);
	} else if (c == `"`) { // start of key string
		state = State.MemberKey;
	}
}

function memberKey<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // end of key string
		state = State.PostKey;
		handler.onKey(keyStack, stringBuffer);
		keyStack.push(stringBuffer);
		resetStringBuffer();
	} else {
		stringBuffer += c;
	}
}

function postKey<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `:`) {
		state = State.PostDelimiter;
	}
}

function postDelimiter<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // start of string
		state = State.ValueString;
	} else if (c == `t` || c == `f`) { // start of true | false
		stringBuffer += c;
		state = State.ValueBool
	} else if (c == `n`) { // start of null
		stringBuffer += c;
		state = State.ValueNull;
	} else if (numeric.includes(c)) { // start of a number
		stringBuffer += c;
		state = State.ValueNumber;
	} else if (c == `{`) {	// start of a child object
		state = State.ObjectInitial;
		handler.onObjectStart(keyStack);
	}
}

/*----------  Value parsing states  ----------*/


function valueString<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // end of string
		state = State.PostMember;
		handler.onString(keyStack, stringBuffer);
		keyStack.pop();
		resetStringBuffer();
	} else {
		stringBuffer += c;
	}
}

function valueBool<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	stringBuffer += c;
	if(stringBuffer == "true") { // end of true literal
		state = State.PostMember;
		handler.onBool(keyStack, true);
		keyStack.pop();
		resetStringBuffer();
	} else if (stringBuffer == "false") { // end of false literal
		state = State.PostMember;
		handler.onBool(keyStack, false);
		keyStack.pop();
		resetStringBuffer();
	}
}

function valueNull<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	stringBuffer += c;
	if(stringBuffer == "null") { // end of true literal
		state = State.PostMember;
		handler.onNull(keyStack);
		keyStack.pop();
		resetStringBuffer();
	}
}

function valueNumber<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(whitespace.includes(c)) { // end of a number delim by whitespace
		state = State.PostMember;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		resetStringBuffer();
	} else if (c == `,`) { // jump straight to postMemberDelimiter
		state = State.PostMemberDelimiter;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		resetStringBuffer();
	} else if (c == `}`) { // jump straight to end of object
		state = State.Start;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		handler.onObjectEnd(keyStack);
		if(keyStack.length > 0) {
			keyStack.pop();
		} else {
			// either invalid json or end of the object
		}
		resetStringBuffer();
	} else {
		stringBuffer += c; // TODO: add error checking here
	}
}

function handleNumberParsing<HandlerType extends Handler>(numberString: string, handler: HandlerType): void {
	if(numberString.includes('.')) { // maybe find better way to tell if it is a float
		handler.onFloat(keyStack, parseFloat(stringBuffer), stringBuffer);
	} else {
		handler.onInt(keyStack, parseI32(stringBuffer, 10), stringBuffer);
	}
	keyStack.pop();
}

/*----------  end  ----------*/


function postMember<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `,`) {
		state = State.PostMemberDelimiter
	} else if (c == `}`) {
		state = State.Start;
		handler.onObjectEnd(keyStack);
		if(keyStack.length > 0) {
			keyStack.pop();
		} else {
			// either invalid json or end of the object
		}
	}
}

function postMemberDelimiter<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // start of string
		state = State.MemberKey;
	}
}

function resetStringBuffer(): void {
	stringBuffer = "";
}



export function parseString<HandlerType extends Handler>(jsonString: string, handler: HandlerType): i32 {
	// initialization
	state = State.Start;
	resetStringBuffer()
	i = 0;
	keyStack = new Array<string>(MAX_DEPTH);

	for(; i < jsonString.length; ++i) {
		let c: string = jsonString[i];
		switch(state) {
			case State.Start:
				start<HandlerType>(c, handler);
				break;
			case State.ObjectInitial:
				objectInitial<HandlerType>(c, handler);
				break;
			case State.MemberKey:
				memberKey<HandlerType>(c, handler);
				break;
			case State.PostKey:
				postKey<HandlerType>(c, handler);
				break;
			case State.PostDelimiter:
				postDelimiter<HandlerType>(c, handler);
				break;
			case State.ValueString:
				valueString<HandlerType>(c, handler);
				break;
			case State.ValueBool:
				valueBool<HandlerType>(c, handler);
				break;
			case State.ValueNull:
				valueNull<HandlerType>(c, handler);
				break;
			case State.ValueNumber:
				valueNumber<HandlerType>(c, handler);
				break;
			case State.PostMember:
				postMember<HandlerType>(c, handler);
				break;
			case State.PostMemberDelimiter:
				postMemberDelimiter<HandlerType>(c, handler);
				break;
		}
	}

	// free memory
	memory.free(<usize>keyStack);
	// memory.free(<usize>stringBuffer);

	return -1;
}