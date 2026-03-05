import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { reviver } from "../persister";

describe("reviver", () => {
	it("returns DateTime object for a valid ISO date string", () => {
		const validIsoString = "2023-10-01T12:00:00.000Z";
		const result = reviver("someKey", validIsoString);
		expect(result).toBeInstanceOf(DateTime);
		expect((result as DateTime).isValid).toBe(true);
		expect((result as DateTime).toISO()).toBe("2023-10-01T21:00:00.000+09:00");
	});

	it("returns original string for an invalid date string", () => {
		const invalidDateString = "not-a-date";
		const result = reviver("someKey", invalidDateString);
		expect(result).toBe(invalidDateString);
	});

	it("returns original string for a generic string", () => {
		const genericString = "hello world";
		const result = reviver("someKey", genericString);
		expect(result).toBe(genericString);
	});

	it("returns original value for numbers", () => {
		const num = 123;
		const result = reviver("someKey", num);
		expect(result).toBe(num);
	});

	it("returns original value for booleans", () => {
		const bool = true;
		const result = reviver("someKey", bool);
		expect(result).toBe(bool);
	});

	it("returns original value for null", () => {
		const result = reviver("someKey", null);
		expect(result).toBeNull();
	});

	it("returns original value for objects", () => {
		const obj = { key: "value" };
		const result = reviver("someKey", obj);
		expect(result).toEqual(obj);
	});

	it("returns original value for arrays", () => {
		const arr = [1, 2, 3];
		const result = reviver("someKey", arr);
		expect(result).toEqual(arr);
	});
});
