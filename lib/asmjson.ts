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

export class JsonParser<HandlerType extends Handler> {
	currentIndex: u32 = 0;
	jsonString: string = "";
	handler: HandlerType;

	parseString(jsonString: string, handler: HandlerType): i32 {
		this.jsonString = jsonString;
		this.currentIndex = 0;
		this.handler = handler;

		let firstCharacter: string = this.nextNonWhitespace();
		if ('{' == firstCharacter) {
			this.handleObjectFirst();
		} else {
			// error. A json string must start with an object	
			return -1
		}

		return 0
	}




	// private handleValue(char: string): void {
	// 	if ('{' == char) {
	// 		this.handleObjectFirst();
	// 	// } else if ('[' == char) {
	// 	// 	this.handleArrayFirst();
	// 	} else if ('"' == char) {
	// 		this.handler.onString(readNextString());
	// 	// } else if (']' == char) {
	// 	// 	throw syntaxError(error);
	// 	// } else if ('}' == char) {
	// 	// 	throw syntaxError(error);
	// 	} else {
	// 		this.handleLiteral(char);
	// 	}
	// }

	private handleObjectFirst(): void {
		this.handler.onObjectStart();
		let nextChar: string = this.nextNonWhitespace();
		if ('}' == nextChar) {
			this.handler.onObjectEnd();
			return;
		} else if (nextChar == `"`) {
			// this.handleObjectValue();
			// this.handleObjectFollowing();
			return;
		} else {
			return;
		}
	}

	private handleObjectValue(): void {
		this.handler.onKey(this.readNextString());

		let nextChar: string = this.nextNonWhitespace();
		if (':' == nextChar) {
			return this.handleValue();
		} else {
			return;
			// throw syntaxError(JsonSyntaxError.INVALID_OBJECT_SEPARATION);
		}
	}

	private handleValue(): void {

	}

	private handleObjectFollowing(): void {

	}

	private readNextString(): string {
		return "";
	}

	private handleLiteral(): void {

	}


	private currentChar(): string {
		return this.jsonString[this.currentIndex];
	}

	private remainingChars(): u32 {
		return this.jsonString.length - this.currentIndex
	}

	private nextNonWhitespace(): string {
		for(let i: u32 = 0; i < this.remainingChars(); ++i) {
			let nextChar = this.nextChar();
			if (' ' != nextChar && '\t' != nextChar && '\n' != nextChar && '\r' != nextChar) {
				return nextChar;
			}
		}
		return '\0' // reached the end of the string
	}

	private nextChar(): string {
		let c = this.currentChar();
		this.currentIndex += 1;
		return c;
	}
}