export function mergeObjects<T extends Object>(target: T, ...sources: T[]): T {
  if (sources.length === 0) {
    return target;
  }
  const source = sources[0];
  const newObj = mergeObject(target, source);
  return mergeObjects(newObj, ...sources.slice(1));
}

export function mergeObject<T extends Object>(target: T, source: T): T {
  const newObj: Partial<T> = {...source, ...target};

  for (const key of Object.keys(source)) {
    const k: keyof T = key as any;
    const tObj = target[k];
    const sObj = source[k];
    if (tObj instanceof Object && sObj instanceof Object) {
      newObj[k] = {...sObj, ...mergeObjects(tObj, sObj)};
    }
  }

  return {...target, ...source, ...newObj};
}
