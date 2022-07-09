import { Paper, Typography } from "@mui/material";
import React from "react";
import { Variant } from '@mui/material/styles';

const StoryRender: React.FC<{
  story: string;
  className?: string;
  children?: never;
  variant?: Variant;
}> = React.memo(({ className, story, variant = "caption" }) => (
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
));

export default StoryRender;
