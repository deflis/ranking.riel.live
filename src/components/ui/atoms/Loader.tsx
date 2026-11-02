import type { ComponentProps } from "react";

import styles from "./Loader.module.css";

type PulseLoaderProps = ComponentProps<"span"> & { disabled?: boolean };

export const PulseLoader: React.FC<PulseLoaderProps> = ({
	className,
	disabled = false,
	...props
}: PulseLoaderProps) => (
	<span
		className={[styles.pulse, !disabled && styles.animated, className]
			.filter(Boolean)
			.join(" ")}
		{...props}
	/>
);

export const DotLoader: React.FC<ComponentProps<"span">> = ({ ...props }) => (
	<span className={styles.dots} {...props}>
		<span className={styles.dot} />
		<span className={styles.dot} />
		<span className={styles.dot} />
	</span>
);
