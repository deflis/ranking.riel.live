import { describe, expect, it } from "vitest";
import { filterRankingData } from "../ranking";
import type { Item } from "../types";

describe("filterRankingData", () => {
	it("isUseFilterがfalseのとき、データをそのまま返す", () => {
		const mockData = [{ ncode: "n1" }, { ncode: "n2" }];
		const mockItems: { data: Item | null }[] = [];
		const isUseFilter = false;
		const filter = (_item: Item) => true;

		const result = filterRankingData(mockData, mockItems, isUseFilter, filter);
		expect(result).toEqual(mockData);
	});

	it("isUseFilterがtrueのとき、dataがnullのアイテムを除外する", () => {
		const mockData = [{ ncode: "n1" }, { ncode: "n2" }, { ncode: "n3" }];
		const mockItems = [
			{ data: { ncode: "n1" } as Item },
			{ data: null }, // dataがnull
			{ data: { ncode: "n3" } as Item },
		];
		const isUseFilter = true;
		const filter = () => true;

		const result = filterRankingData(mockData, mockItems, isUseFilter, filter);
		expect(result).toEqual([{ ncode: "n1" }, { ncode: "n3" }]);
	});

	it("isUseFilterがtrueのとき、filter条件に合わないアイテムを除外する", () => {
		const mockData = [{ ncode: "n1" }, { ncode: "n2" }];
		const mockItems = [
			{ data: { ncode: "n1" } as Item },
			{ data: { ncode: "n2" } as Item },
		];
		const isUseFilter = true;
		const filter = (item: Item) => item.ncode === "n1";

		const result = filterRankingData(mockData, mockItems, isUseFilter, filter);
		expect(result).toEqual([{ ncode: "n1" }]);
	});
});
