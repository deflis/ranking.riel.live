import clsx from "clsx";
import type { ComponentProps } from "react";

import styles from "./form.module.css";

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
			className={clsx(styles.input, className)}
		/>
	);
}
