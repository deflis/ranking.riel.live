import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import { OutboundLink } from "react-ga";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: "flex",
      justifyContent: "center",
    },
    image: {
      maxWidth: "100%",
    },
  })
);

export const SelfAd: React.FC = React.memo(() => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <OutboundLink to="https://riel.live" eventLabel="SelfAd">
        <img src="/ad.jpg" alt="私が作りました" className={classes.image} />
      </OutboundLink>
    </div>
  );
});
