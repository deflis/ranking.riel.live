import React from "react";
import { Paper } from "../atoms/Paper";

const StoryRender: React.FC<{
  story: string;
  className?: string;
  children?: never;
}> = React.memo(({ className, story }) => (
  <Paper className={className}>
    <p>
      {story.split("\n").reduce<JSX.Element | null>(
        (prev, line) => (
          <>
            {prev}
            {prev && <br />}
            {line}
          </>
        ),
        null
      )}
    </p>
  </Paper>
));

export default StoryRender;
