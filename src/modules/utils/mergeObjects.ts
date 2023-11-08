// eslint-disable-next-line @typescript-eslint/ban-types
export function mergeObjects<T extends Object>(target: T, ...sources: T[]): T {
  if (sources.length === 0) {
    return target;
  }
  const source = sources[0];
  const newObj = mergeObject(target, source);
  return mergeObjects(newObj, ...sources.slice(1));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function mergeObject<T extends Object>(target: T, source: T): T {
  const newObj: T = { ...source, ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const tObj = target[key];
    const sObj = source[key];
    if (tObj instanceof Object && sObj instanceof Object) {
      newObj[key] = { ...sObj, ...mergeObject(tObj, sObj) };
    }
  }

  return { ...target, ...source, ...newObj };
}
