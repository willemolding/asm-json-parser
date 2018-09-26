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


export function parseString<HandlerType extends Handler>(jsonString: string, handler: HandlerType): i32 {

	handler.onObjectStart();
	handler.onObjectEnd();

	return 0;
}