import type { ComponentProps } from "react";

export function Paper({ className, ref, ...props }: ComponentProps<"div">) {
	return (
		<div
			ref={ref}
			className={[
				"border-gray-200 shadow-md dark:border-gray-700 block box-border rounded-lg",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		/>
	);
}
