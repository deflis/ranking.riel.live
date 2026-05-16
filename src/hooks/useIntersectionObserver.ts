import { useEffect, useRef } from "react";

export const useIntersectionObserver = (
	callback: () => void,
	options?: IntersectionObserverInit,
) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					callback();
				}
			}
		}, options);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [callback, options]);

	return ref;
};