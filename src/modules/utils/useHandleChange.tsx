import { useCallback } from "react";

export function useHandleChange<T extends string>(
	setter: (value: T) => void,
): React.ChangeEventHandler<{ value: string }> {
	return useCallback((e) => setter(e.target.value as T), [setter]);
}
