import clsx from "clsx";
import type { ComponentProps, ElementType } from "react";

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
			className={clsx(
				"link-reset box-border rounded-full bg-gray-200 inline-flex text-sm h-8 justify-center align-middle items-center dark:bg-zinc-700",
				className,
			)}
			{...props}
		>
			<span className="px-2">{children}</span>
		</Component>
	);
}
