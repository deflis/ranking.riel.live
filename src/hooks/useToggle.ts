import { useCallback, useState } from "react";

export const useToggle = (
	initialValue: boolean,
): [boolean, (nextValue?: any) => void] => {
	const [value, setValue] = useState(initialValue);
	const toggle = useCallback((nextValue?: any) => {
		if (typeof nextValue === "boolean") {
			setValue(nextValue);
		} else {
			setValue((v) => !v);
		}
	}, []);
	return [value, toggle];
};
