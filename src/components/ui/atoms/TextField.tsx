import type { ComponentProps } from "react";

import styles from "./Input.module.css";

export function TextField({
	className,
	type,
	ref,
	...props
}: ComponentProps<"input">) {
	return (
		<input
			ref={ref}
			type={type ?? "text"}
			{...props}
			className={[styles.input, className].filter(Boolean).join(" ")}
		/>
	);
}
