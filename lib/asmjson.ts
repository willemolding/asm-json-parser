import "allocator/tlsf";

// These functions should be provided to this module via the import and used to customize the parser

export class Handler {
	onObjectStart(): boolean { return true }
}


export function parseString<HandlerType>(jsonString: string, handler: HandlerType): i32 {

	handler.onObjectStart();

	return 0;
}

