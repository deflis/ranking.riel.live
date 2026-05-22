import { useEffect, useRef } from "react";

interface AmazonAdProps {
	scriptSrc: string;
	id?: string;
}

export function AmazonAd({ scriptSrc, id }: AmazonAdProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === "undefined" || !containerRef.current) return;

		if (containerRef.current.querySelector("script")) return;

		const script = document.createElement("script");
		script.src = scriptSrc;
		script.type = "text/javascript";
		script.async = true;

		if (id) {
			script.id = id;
		}

		containerRef.current.appendChild(script);

		return () => {
			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
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
