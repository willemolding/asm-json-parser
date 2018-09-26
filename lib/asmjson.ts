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
	onInt(value: i32): boolean { return true }
}



enum State {
	Start = 0,
	ObjectInitial = 1,
	MemberKey = 2,
	PreDelimiter = 3,
	PostDelimiter = 4,
	MemberValue = 5,
	PostMember = 6,
	PostMemberDelimiter = 7,
	ObjectFinish = 8,
	Finish = 9
}

const whitespace: Array<string> = [" ", "\t", "\n", "\r"];

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
	} else if (c == `"`) {
		state = State.MemberKey;
	}
}

function memberKey<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) {
		state = State.PreDelimiter;
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
		state = State.MemberValue;
	}
}

// TODO: modifiy to handle values other than strings...
function memberValue<HandlerType extends Handler>(c: string, handler: HandlerType): void {
	if(c == `"`) { // end of string
		state = State.PostMember;
		handler.onString(stringBuffer);
		stringBuffer = "";
	} else {
		stringBuffer += c;
	}
}

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

function finish<HandlerType extends Handler>(c: string, handler: HandlerType): void {

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
			case State.PreDelimiter:
				preDelimiter<HandlerType>(c, handler);
				break;
			case State.PostDelimiter:
				postDelimiter<HandlerType>(c, handler);
				break;
			case State.MemberValue:
				memberValue<HandlerType>(c, handler);
				break;
			case State.PostMember:
				postMember<HandlerType>(c, handler);
				break;
		}
	}

	return -1;
}