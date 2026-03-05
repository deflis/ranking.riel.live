import { describe, expect, it } from "vitest";
import { mergeObject, mergeObjects } from "../mergeObjects";

describe("mergeObject", () => {
	it("シンプルなオブジェクトをマージし、sourceがtargetを上書きすること", () => {
		const target: Record<string, unknown> = { a: 1, b: 2 };
		const source: Record<string, unknown> = { b: 3, c: 4 };
		expect(mergeObject(target, source)).toEqual({ a: 1, b: 3, c: 4 });
	});

	it("sourceとtargetにしかないキーが正しくマージされること", () => {
		const target: Record<string, unknown> = {
			targetOnly: "targetValue",
			shared: "t",
		};
		const source: Record<string, unknown> = {
			sourceOnly: "sourceValue",
			shared: "s",
		};
		expect(mergeObject(target, source)).toEqual({
			targetOnly: "targetValue",
			sourceOnly: "sourceValue",
			shared: "s",
		});
	});

	it("ネストされたオブジェクトを深くマージすること", () => {
		const target: Record<string, unknown> = { a: { x: 1, y: 2 } };
		const source: Record<string, unknown> = { a: { y: 3, z: 4 } };
		expect(mergeObject(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 } });
	});

	it("配列はマージせず置き換えること", () => {
		const target: Record<string, unknown> = { a: [1, 2] };
		const source: Record<string, unknown> = { a: [3, 4, 5] };
		expect(mergeObject(target, source)).toEqual({ a: [3, 4, 5] });
	});

	it("null値を正しく処理すること", () => {
		const target: Record<string, unknown> = { a: { b: 1 }, c: null };
		const source: Record<string, unknown> = { a: null, c: { d: 2 } };
		expect(mergeObject(target, source)).toEqual({ a: null, c: { d: 2 } });
	});

	it("プリミティブ値はマージせず置き換えること", () => {
		const target: Record<string, unknown> = { a: { b: 1 } };
		const source: Record<string, unknown> = { a: 42 };
		// @ts-ignore
		expect(mergeObject(target, source)).toEqual({ a: 42 });
	});

	it("プロトタイプ汚染を防ぐため、特定のキーを無視すること", () => {
		const target: Record<string, unknown> = {};
		const payload = JSON.parse('{"__proto__": {"polluted": "yes"}}');
		const result = mergeObject(target, payload);

		// biome-ignore lint/suspicious/noExplicitAny: needed for prototype testing
		expect((result as any).__proto__.polluted).toBeUndefined();
		// biome-ignore lint/suspicious/noExplicitAny: needed for prototype testing
		expect(({} as any).polluted).toBeUndefined();

		const payloadConstructor = JSON.parse(
			'{"constructor": {"prototype": {"polluted2": "yes"}}}',
		);
		const resultConstructor = mergeObject(target, payloadConstructor);

		expect(resultConstructor.constructor).toBe(Object);
		// biome-ignore lint/suspicious/noExplicitAny: needed for prototype testing
		expect(({} as any).polluted2).toBeUndefined();
	});
});

describe("mergeObjects", () => {
	it("複数のオブジェクトをマージすること", () => {
		const target: Record<string, unknown> = { a: 1 };
		const source1: Record<string, unknown> = { b: 2 };
		const source2: Record<string, unknown> = { c: 3 };
		expect(mergeObjects(target, source1, source2)).toEqual({
			a: 1,
			b: 2,
			c: 3,
		});
	});

	it("後から指定されたsourceのプロパティで正しく上書きすること", () => {
		const target: Record<string, unknown> = { a: 1, b: { c: 2 } };
		const source1: Record<string, unknown> = { b: { c: 3, d: 4 } };
		const source2: Record<string, unknown> = { b: { c: 5 } };
		expect(mergeObjects(target, source1, source2)).toEqual({
			a: 1,
			b: { c: 5, d: 4 },
		});
	});
});
