import type { ComponentProps } from "react";

import styles from "./Paper.module.css";

export function Paper({ className, ref, ...props }: ComponentProps<"div">) {
	return (
		<div
			ref={ref}
			className={[styles.paper, className].filter(Boolean).join(" ")}
			{...props}
		/>
	);
}
