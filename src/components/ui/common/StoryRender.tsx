import type React from "react";

import { Paper } from "../atoms/Paper";

import styles from "./StoryRender.module.css";

type StoryRenderProps = {
	story: string;
	className?: string;
	children?: never;
};

const StoryRender: React.FC<StoryRenderProps> = ({
	className,
	story,
}: StoryRenderProps) => {
	return (
		<Paper className={className}>
			<p className={styles.story}>{story}</p>
		</Paper>
	);
};

export default StoryRender;
