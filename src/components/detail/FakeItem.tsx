import React from "react";
import { Typography, Grid, Paper } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

const FakeItem: React.FC = () => (
  <>
    <Typography variant="subtitle1">
      <Skeleton variant="text" />
    </Typography>
    <Typography variant="h4" component="h1">
      <Skeleton variant="text" />
    </Typography>
    <Typography variant="subtitle2">
      <Skeleton variant="text" />
    </Typography>
    <Grid container spacing={3}>
      <Grid item sm={7}>
        <Typography variant="h5" component="h2">
          あらすじ
        </Typography>
        <Paper>
          <Skeleton variant="rect" />
        </Paper>
      </Grid>
      <Grid item sm={5}></Grid>
    </Grid>
  </>
);
export default FakeItem;
