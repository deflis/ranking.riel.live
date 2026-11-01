import { useEffect, useRef } from "react";

import { Button } from "../atoms/Button";

export const LoadMore = ({
	onLoadMore,
	className,
}: {
	onLoadMore: () => void;
	className?: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const callbackRef = useRef(onLoadMore);

	useEffect(() => {
		callbackRef.current = onLoadMore;
	}, [onLoadMore]);

	useEffect(() => {
		const element = ref.current;
		if (!element || typeof IntersectionObserver === "undefined") return;

		let active = true;
		const observer = new IntersectionObserver((entries) => {
			if (active && entries.some((entry) => entry.isIntersecting)) {
				callbackRef.current();
			}
		});
		observer.observe(element);

		return () => {
			active = false;
			observer.disconnect();
		};
	}, []);

	return (
		<div
			ref={ref}
			className={["col-span-full", className].filter(Boolean).join(" ")}
		>
			<Button onClick={onLoadMore} className="w-full h-20 text-3xl">
				もっと見る
			</Button>
		</div>
	);
};
