import type { ComponentProps } from "react";

import styles from "./form.module.css";

export function Checkbox({
	className,
	ref,
	...props
}: ComponentProps<"input">) {
	return (
		<input
			ref={ref}
			type="checkbox"
			className={[styles.checkbox, className].filter(Boolean).join(" ")}
			{...props}
		/>
	);
}
