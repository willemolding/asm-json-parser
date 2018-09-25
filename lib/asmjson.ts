import "allocator/tlsf";

// These functions should be provided to this module via the import and used to customize the parser

export declare function onNull(): boolean;
export declare function onTrue(): boolean;
export declare function onFalse(): boolean;
export declare function onStartObject(): boolean;
export declare function onEndObject(memberCount: u32): boolean;




export function parseString(jsonString: string): i32 {
	var c = jsonString[0];

	// while(c !== '\0') {
		onNull();
	// }

	return 0;
}

