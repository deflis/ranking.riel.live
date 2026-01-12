import clsx from "clsx";
import type React from "react";
import type { ComponentProps, ElementType } from "react";

import styles from "./Tag.module.css";

// Polymorphic component types
type ColorName = "cyan" | "lightGreen" | "red";

export type TagProps<C extends ElementType = "span"> = {
	as?: C;
	tagColor?: ColorName;
	light?: boolean;
} & ComponentProps<C>;

export function Tag<C extends ElementType = "span">({
	as,
	tagColor,
	className,
	light,
	ref,
	...props
}: TagProps<C>) {
	const Component = as ?? "span";
	return (
		<Component
			ref={ref}
			className={clsx(
				"link-reset",
				styles.tag,
				tagColor === "cyan" && styles.cyan,
				tagColor === "lightGreen" && styles["light-green"],
				tagColor === "red" && styles.red,
				className,
			)}
			{...props}
		/>
	);
}

export const Tags: React.FC<{
	addons?: boolean;
	children: React.ReactNode;
}> = ({ addons, children }) => (
	<span className={clsx("tags", addons && "addon")}>{children}</span>
);
