export function chunk<T>(arr: readonly T[], size: number): T[][] {
	if (size <= 0) {
		throw new Error("size must be greater than 0");
	}
	return arr.reduce(
		// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
		(newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
		[] as T[][],
	);
}
