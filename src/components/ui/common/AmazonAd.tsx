import { useEffect, useRef } from "react";

interface AmazonAdProps {
	scriptSrc: string;
	id?: string;
}

export function AmazonAd({ scriptSrc, id }: AmazonAdProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (typeof window === "undefined" || !container) return;

		if (container.querySelector("script")) return;

		const script = document.createElement("script");
		script.src = scriptSrc;
		script.type = "text/javascript";
		script.async = true;

		if (id) {
			script.id = id;
		}

		container.appendChild(script);

		return () => {
			container.innerHTML = "";
		};
	}, [scriptSrc, id]);

	return (
		<div
			ref={containerRef}
			className="amazon-ad-container"
			style={{ minHeight: "250px", display: "flex", justifyContent: "center" }}
		/>
	);
}
