import type { FilterConfig } from "../atoms/filter";

type RangeConfig = Pick<FilterConfig, "story" | "length" | "firstUpdate">;

/** 非制御入力の値を、選択状態を管理する設定に反映する。 */
export function readFilterFormData<T extends RangeConfig>(
	data: FormData,
	config: T,
): T {
	const readNumber = (name: string, fallback: number): number => {
		const value = data.get(name);
		// 無効な入力欄はFormDataに含まれない。
		if (value === null) return fallback;
		return value === "" ? Number.NaN : Number(value);
	};

	const readRange = (name: "story" | "length") => ({
		min: {
			...config[name].min,
			value: readNumber(`${name}.min.value`, config[name].min.value),
		},
		max: {
			...config[name].max,
			value: readNumber(`${name}.max.value`, config[name].max.value),
		},
	});

	return {
		...config,
		story: readRange("story"),
		length: readRange("length"),
		firstUpdate: {
			...config.firstUpdate,
			begin: String(data.get("firstUpdate.begin") ?? config.firstUpdate.begin),
		},
	};
}
