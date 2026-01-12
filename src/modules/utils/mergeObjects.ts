export function mergeObjects<T extends object>(target: T, ...sources: T[]): T {
	if (sources.length === 0) {
		return target;
	}
	const source = sources[0];
	const newObj = mergeObject(target, source);
	return mergeObjects(newObj, ...sources.slice(1));
}

export function mergeObject<T extends object>(target: T, source: T): T {
	const newObj: T = { ...source, ...target };

	for (const key of Object.keys(source) as Array<keyof T>) {
		const tObj = target[key];
		const sObj = source[key];
		if (
			typeof tObj === "object" &&
			tObj !== null &&
			typeof sObj === "object" &&
			sObj !== null
		) {
			newObj[key] = { ...sObj, ...mergeObject(tObj as object, sObj as object) };
		}
	}

	return { ...target, ...source, ...newObj };
}
