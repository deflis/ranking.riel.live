import React from "react";

import { Paper } from "../atoms/Paper";

type StoryRenderProps = {
  story: string;
  className?: string;
  children?: never;
};

const StoryRender: React.FC<StoryRenderProps> = React.memo(
  function StoryRenderBase({ className, story }: StoryRenderProps) {
    return (
      <Paper className={className}>
        <p>
          {story.split("\n").reduce<React.ReactNode | null>(
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
    );
  }
);

export default StoryRender;
