export function mergeObjects<T extends object>(target: T, ...sources: T[]): T {
	if (sources.length === 0) {
		return target;
	}
	const source = sources[0];
	const newObj = mergeObject(target, source);
	return mergeObjects(newObj, ...sources.slice(1));
}

export function mergeObject<T extends object>(target: T, source: T): T {
	const newObj: T = { ...target, ...source };

	for (const key of Object.keys(source) as Array<keyof T>) {
		const tObj = target[key];
		const sObj = source[key];
		if (
			typeof tObj === "object" &&
			tObj !== null &&
			!Array.isArray(tObj) &&
			typeof sObj === "object" &&
			sObj !== null &&
			!Array.isArray(sObj)
		) {
			newObj[key] = mergeObject(tObj as object, sObj as object) as T[keyof T];
		}
	}

	return newObj;
}
