import clsx from "clsx";
import type React from "react";
import {
	type ComponentPropsWithoutRef,
	type ElementType,
	type ForwardedRef,
	type PropsWithRef,
	type ReactElement,
	forwardRef,
} from "react";

import styles from "./Tag.module.css";

type ColorName = "cyan" | "lightGreen" | "red";

export type TagProps<T extends ElementType = "span"> = {
	as?: T;
	tagColor?: ColorName;
	light?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "tagColor">;

function TagBase<T extends ElementType = "span">(
	{ as, tagColor, className, light, ...props }: TagProps<T>,
	ref?: ForwardedRef<T>,
) {
	const Component = as ?? "span";
	return (
		<Component
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ref={ref as any}
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

type Tag = <T extends ElementType = "a">(
	x: PropsWithRef<TagProps<T>>,
) => ReactElement | null;

export const Tag = forwardRef(TagBase) as Tag;

export const Tags: React.FC<{
	addons?: boolean;
	children: React.ReactNode;
}> = ({ addons, children }) => (
	<span className={clsx("tags", addons && "addon")}>{children}</span>
);
