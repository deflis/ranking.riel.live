import React from "react";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  Link,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";

import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles((theme) =>
  createStyles({
    contents: {
      "& > *:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
    title: {
      ...(theme.ranking.titleHeight !== 0
        ? {
            overflow: "hidden",
            display: "box",
            boxOrient: "vertical",
            lineClamp: theme.ranking.titleHeight,
          }
        : {}),
    },
    story: {
      margin: theme.spacing(0, 2),
      background: theme.palette.background.default,
    },
    actions: {
      justifyContent: "flex-end",
    },
    flexGap: {
      flexGrow: 1,
    },
    keywords: {
      display: theme.ranking.showKeyword ? "flex" : "none",
      flexWrap: "wrap",
      background: theme.palette.background.default,
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
  })
);

const FakeItem: React.FC = () => {
  const styles = useStyles();
  return (
    <Card>
      <CardContent className={styles.contents}>
        <Typography color="textSecondary">
          <Skeleton variant="text" />
        </Typography>
        <Typography color="textSecondary">
          <Skeleton variant="text" />
        </Typography>
        <Typography variant="h5" component="h2" className={styles.title}>
          <Skeleton variant="text" />
        </Typography>
        <Typography color="textSecondary">
          <Skeleton variant="text" />
        </Typography>
        <Typography color="textSecondary">
          <Skeleton variant="text" />
        </Typography>
        <Typography color="textSecondary">
          <Skeleton variant="text" />
        </Typography>
        <Paper className={styles.keywords} variant="outlined">
          <Skeleton variant="text" width={50} />
        </Paper>
      </CardContent>
      <CardActions className={styles.actions}>
        <Button>あらすじを表示</Button>
        <div className={styles.flexGap} />
        <Link>小説情報</Link>
        <Button variant="contained">読む</Button>
      </CardActions>
    </Card>
  );
};

export default FakeItem;
