export function mergeObjects<T extends object>(target: T, ...sources: T[]): T {
	if (sources.length === 0) {
		return target;
	}
	const source = sources[0];
	const newObj = mergeObject(target, source);
	return mergeObjects(newObj, ...sources.slice(1));
}

function isMergeableObject(val: unknown): val is object {
	return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function mergeObject<T extends object>(target: T, source: T): T {
	const newObj: T = { ...target, ...source };

	for (const key of Object.keys(source) as Array<keyof T>) {
		const tObj = target[key];
		const sObj = source[key];
		if (isMergeableObject(tObj) && isMergeableObject(sObj)) {
			newObj[key] = mergeObject(tObj, sObj) as T[keyof T];
		}
	}

	return newObj;
}
