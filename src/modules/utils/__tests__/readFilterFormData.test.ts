import { describe, expect, it } from "vitest";

import { readFilterFormData } from "../readFilterFormData";

function createConfig() {
	return {
		keyword: "初期値",
		story: {
			min: { enable: true, value: 1 },
			max: { enable: false, value: 1000 },
		},
		length: {
			min: { enable: true, value: 100 },
			max: { enable: true, value: 1000000 },
		},
		firstUpdate: { term: "custom" as const, begin: "2026-01-01", end: "" },
	};
}

describe("readFilterFormData", () => {
	it("送信時の数値と日付を反映し、選択状態や元の設定を保持する", () => {
		const config = createConfig();
		const data = new FormData();
		data.set("story.min.value", "12");
		data.set("length.min.value", "2500");
		data.set("length.max.value", "300000");
		data.set("firstUpdate.begin", "2026-10-01");

		const result = readFilterFormData(data, config);

		expect(result.story.min).toEqual({ enable: true, value: 12 });
		expect(result.length.min.value).toBe(2500);
		expect(result.length.max.value).toBe(300000);
		expect(result.firstUpdate).toEqual({
			term: "custom",
			begin: "2026-10-01",
			end: "",
		});
		expect(result.keyword).toBe("初期値");
		expect(config).toEqual(createConfig());
	});

	it("無効な入力欄が送信されなくても設定値を失わない", () => {
		const config = createConfig();
		expect(readFilterFormData(new FormData(), config)).toEqual(config);
	});

	it("空の数値を0に変換せず、空の日付もそのまま反映する", () => {
		const data = new FormData();
		data.set("story.min.value", "");
		data.set("firstUpdate.begin", "");
		const result = readFilterFormData(data, createConfig());
		expect(result.story.min.value).toBeNaN();
		expect(result.firstUpdate.begin).toBe("");
	});
});
