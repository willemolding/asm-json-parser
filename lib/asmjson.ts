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
	KeyValueDelimiter = 3,
	MemberValue = 4,
	MemberDelimiter = 5,
	ObjectFinish = 6,
	Finish = 7
}

const whitespace: Array<string> = [" ", "\t", "\n", "\r"];
// state functions

function start(): void {

}

function objectInitial(): void {

}

function memberKey(): void {

}

function keyValueDelimiter(): void {

}

function memberValue(): void {

}

function memberDelimiter(): void {

}

function objectFinish(): void {

}

function finish(): void {

}

export function parseString<HandlerType extends Handler>(jsonString: string, handler: HandlerType): i32 {
	let state: State = State.Start;
	return 0;
}