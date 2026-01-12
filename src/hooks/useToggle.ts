import { useCallback, useState } from "react";

export function useToggle(
	initialValue: boolean,
): [boolean, (nextValue?: unknown) => void] {
	const [value, setValue] = useState(initialValue);
	const toggle = useCallback((nextValue?: boolean | unknown) => {
		if (typeof nextValue === "boolean") {
			setValue(nextValue);
		} else {
			setValue((v) => !v);
		}
	}, []);

	return [value, toggle];
}
