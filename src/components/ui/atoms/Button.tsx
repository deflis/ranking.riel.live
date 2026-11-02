import type { ComponentProps, ElementType } from "react";

import styles from "./Button.module.css";

export type ButtonProps<T extends ElementType = "button"> = {
	as?: T;
	color?: "primary";
} & ComponentProps<T>;

export function Button<T extends ElementType = "button">({
	className,
	as,
	color,
	type,
	ref,
	...props
}: ButtonProps<T>) {
	const Component = as ?? "button";
	return (
		<Component
			ref={ref}
			className={[
				"link-reset",
				styles.button,
				color === "primary" && styles.primary,
				className,
			]
				.filter(Boolean)
				.join(" ")}
			type={type ?? "button"}
			{...props}
		/>
	);
}
