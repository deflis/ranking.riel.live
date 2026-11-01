export function useHandleChange<T extends string>(
	setter: (value: T) => void,
): React.ChangeEventHandler<{ value: string }> {
	return (e) => setter(e.target.value as T);
}
