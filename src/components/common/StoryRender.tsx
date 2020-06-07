import { Paper, Typography } from "@material-ui/core";
import React from "react";
import { Variant } from "@material-ui/core/styles/createTypography";

const StoryRender: React.FC<{
  story: string;
  className?: string;
  children?: never;
  variant?: Variant;
}> = ({ className, story, variant = "caption" }) => (
  <Paper variant="outlined" className={className}>
    <Typography variant={variant} component="p">
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
    </Typography>
  </Paper>
);

export default StoryRender;
