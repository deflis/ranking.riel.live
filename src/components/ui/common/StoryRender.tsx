import type React from "react";

import { Paper } from "../atoms/Paper";

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
			<p className="whitespace-pre-wrap">{story}</p>
		</Paper>
	);
};

export default StoryRender;
