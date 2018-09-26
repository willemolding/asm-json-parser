import "allocator/tlsf";

// These functions should be provided to this module via the import and used to customize the parser

export class Handler {
	onObjectStart(): boolean { return true }
	onObjectEnd(): boolean { return true }

	onArrayStart(): boolean { return true }
	onArrayEnd(): boolean { return true }

	onKey(value: string): boolean {return true }

	onNull(): boolean { return true }
	onBool(value: boolean): boolean { return true }
	onString(value: string): boolean { return true }
	onInt(value: i32, stringValue: string): boolean { return true }
	onFloat(value: f64, stringValue: string): boolean { return true }
}



enum State {
	Start = 0,
	ObjectInitial = 1,
	MemberKey = 2,
	PostKey = 3,
	PostDelimiter = 4,
	PostMember = 6,
	PostMemberDelimiter = 7,
	ObjectFinish = 8,

	ValueString = 5,
	ValueBool = 9,
	ValueNull = 10,
	ValueNumber = 11
}

const whitespace: Array<string> = [" ", "\t", "\n", "\r"];
const numeric: Array<string> = ["-",".","0","1","2","3","4","5","6","7","8","9"];

var state: State;
var i: i32;
var stringBuffer: string;

/*----------  State Functions  ----------*/

function start<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `{`) {
		state = State.ObjectInitial;
		handler.onObjectStart();
	}
}

function objectInitial<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `}`) {
		state = State.ObjectInitial;
		handler.onObjectEnd();
	} else if (c == `"`) { // start of key string
		state = State.MemberKey;
	}
}

function memberKey<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // end of key string
		state = State.PostKey;
		handler.onKey(stringBuffer);
		stringBuffer = "";
	} else {
		stringBuffer += c;
	}
}

function preDelimiter<HandlerType extends Handler>(c: string, handler: HandlerType): void {
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
	} else if (numeric.includes(c)) {
		stringBuffer += c;
		state = State.ValueNumber;
	}
}

/*----------  Value parsing states  ----------*/


function valueString<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // end of string
		state = State.PostMember;
		handler.onString(stringBuffer);
		stringBuffer = "";
	} else {
		stringBuffer += c;
	}
}

function valueBool<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	stringBuffer += c;
	if(stringBuffer == "true") { // end of true literal
		state = State.PostMember;
		handler.onBool(true);
		stringBuffer = "";
	} else if (stringBuffer == "false") { // end of false literal
		state = State.PostMember;
		handler.onBool(false);
		stringBuffer = "";
	}
}

function valueNull<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	stringBuffer += c;
	if(stringBuffer == "null") { // end of true literal
		state = State.PostMember;
		handler.onNull();
		stringBuffer = "";
	}
}

function valueNumber<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(whitespace.includes(c)) { // end of a number delim by whitespace
		state = State.PostMember;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		stringBuffer = "";
	} else if (c == `,`) { // jump straight to postMemberDelimiter
		state = State.PostMemberDelimiter;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		stringBuffer = "";
	} else if (c == `}`) { // jump straight to end of object
		state = State.ObjectFinish;
		handleNumberParsing<HandlerType>(stringBuffer, handler)
		handler.onObjectEnd();
		stringBuffer = "";
	} else {
		stringBuffer += c; // TODO: add error checking here
	}
}

function handleNumberParsing<HandlerType extends Handler>(numberString: string, handler: HandlerType): void {
	if(numberString.includes('.')) { // maybe find better way to tell if it is a float
		handler.onFloat(parseFloat(stringBuffer), stringBuffer);
	} else {
		handler.onInt(parseI32(stringBuffer, 10), stringBuffer);
	}

}

/*----------  end  ----------*/


function postMember<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `,`) {
		state = State.PostMemberDelimiter
	} else if (c == `}`) {
		state = State.ObjectFinish;
		handler.onObjectEnd();
	}
}

function postMemberDelimiter<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // start of string
		state = State.MemberKey;
	}
}

function objectFinish<HandlerType extends Handler>(c: string, handler: HandlerType): void {

}


export function parseString<HandlerType extends Handler>(jsonString: string, handler: HandlerType): i32 {
	// initialization
	state = State.Start;
	stringBuffer = "";
	i = 0;

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
				preDelimiter<HandlerType>(c, handler);
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
			case State.ObjectFinish:
				objectFinish<HandlerType>(c, handler);
				break;
		}
	}

	return -1;
}