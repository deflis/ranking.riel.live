import { useEffect, useRef } from "react";

export const useIntersectionObserver = (
	callback: () => void,
	options?: IntersectionObserverInit,
) => {
	const ref = useRef<HTMLDivElement>(null);
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					callbackRef.current();
				}
			}
		}, options);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [options]);

	return ref;
};
