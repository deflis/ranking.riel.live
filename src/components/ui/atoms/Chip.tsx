import type { ComponentProps, ElementType } from "react";

import styles from "./Chip.module.css";

export type ChipProps<T extends ElementType = "a"> = {
	as?: T;
	color?: "primary";
} & ComponentProps<T>;

export function Chip<T extends ElementType = "a">({
	className,
	as,
	children,
	ref,
	...props
}: ChipProps<T>) {
	const Component = as ?? "a";
	return (
		<Component
			ref={ref}
			className={["link-reset", styles.chip, className]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			<span className={styles.content}>{children}</span>
		</Component>
	);
}
