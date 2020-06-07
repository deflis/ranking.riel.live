import { makeStyles, createStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    label: {
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 0,
      marginRight: "1.5rem",
      textAlign: "right",
      fontWeight: "bold",
      "&:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
    body: {
      flexBasis: 0,
      flexGrow: 3,
      flexShrink: 1,
    },
  })
);

const DetailItemText: React.FC<{ label: React.ReactNode }> = ({
  label,
  children,
}) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.label}>{label}</div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};
export default DetailItemText;
