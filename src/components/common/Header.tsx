import React, { useState, useCallback } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faHammer } from "@fortawesome/free-solid-svg-icons";
import { useToggle } from "react-use";
import {
  fade,
  makeStyles,
  InputBase,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  ListItem,
  ListItemText,
  Link,
  Switch,
  FormControlLabel,
  FormControl,
  Button,
  createStyles,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { useHandleChange } from "../../util/useHandleChange";
import { useToggleDarkMode } from "../../util/theme";
import { useAdMode } from "../../util/globalState";
import { AdDialog } from "./AdDialog";

const validateRegexp = /[nN][0-9]{4,}[a-zA-Z]{1,2}/;

function validate(ncode: string): boolean {
  return validateRegexp.test(ncode);
}

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    grow: {
      flexGrow: 1,
    },
    link: {
      margin: theme.spacing(1, 1.5),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      color: theme.palette.text.primary,
      "&:hover": {
        color: theme.palette.text.primary,
      },
    },
    nav: {
      display: "flex",
      flexDirection: "row",
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    search: {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      transition: theme.transitions.create("width"),
      width: "100%",
    },
  })
);

export const Header: React.FC = React.memo(() => {
  const classes = useStyles();

  const [ncode, setNcode] = useState("");
  const history = useHistory();
  const detail = useCallback(() => {
    if (!validate(ncode)) {
      return;
    }
    history.push(`/detail/${ncode}`);
  }, [history, ncode]);

  const handleChangeNcode = useHandleChange(setNcode);
  const [expand, toggle] = useToggle(false);
  const [darkmode, toggleDarkmode] = useToggleDarkMode();
  const [adMode, toggleAdMode] = useAdMode();
  const [showAdDialog, toggleAdDialog] = useToggle(false);
  const handleAdMode = useCallback(() => {
    if (adMode) {
      toggleAdDialog();
    } else {
      toggleAdMode();
    }
  }, [adMode, toggleAdDialog, toggleAdMode]);
  const removeAd = useCallback(() => {
    toggleAdMode();
    toggleAdDialog();
  }, [toggleAdMode, toggleAdDialog]);

  return (
    <>
      <AppBar
        elevation={0}
        className={classes.appBar}
        position="static"
        color="default"
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            <Link
              component={RouterLink}
              className={classes.title}
              to="/"
              color="textPrimary"
              underline="none"
            >
              <FontAwesomeIcon icon={faTrophy} />
              なろうランキング
            </Link>
          </Typography>
          <div className={classes.grow} />
          <nav className={classes.nav}>
            <Link
              component={RouterLink}
              className={classes.link}
              to="/ranking/d"
            >
              日間
            </Link>
            <Link
              component={RouterLink}
              className={classes.link}
              to="/ranking/w"
            >
              週間
            </Link>
            <Link
              component={RouterLink}
              className={classes.link}
              to="/ranking/m"
            >
              月間
            </Link>
            <Link component={RouterLink} className={classes.link} to="/custom">
              カスタムランキング
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Drawer open={expand} onClose={toggle}>
        <ListItem button component={RouterLink} to="/ranking/d">
          <ListItemText primary="日間" />
        </ListItem>
        <ListItem button component={RouterLink} to="/ranking/w">
          <ListItemText primary="週間" />
        </ListItem>
        <ListItem button component={RouterLink} to="/ranking/m">
          <ListItemText primary="週間" />
        </ListItem>
        <ListItem button component={RouterLink} to="/custom">
          <ListItemText primary="カスタムランキング" />
        </ListItem>
        <ListItem button component={RouterLink} to="/about">
          <ListItemText primary="このサイトについて" />
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={<Switch checked={darkmode} onChange={toggleDarkmode} />}
            label="ダークモード"
          />
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={<Switch checked={!adMode} onChange={handleAdMode} />}
            label="広告を表示しない"
          />
        </ListItem>
        <ListItem>
          <FormControl onSubmit={detail}>
            <InputBase
              placeholder="Nコード"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onChange={handleChangeNcode}
              value={ncode}
            />
            <Button disabled={!validate(ncode)} onClick={detail}>
              <FontAwesomeIcon icon={faHammer} />
              詳細を取得
            </Button>
          </FormControl>
        </ListItem>
      </Drawer>
      {showAdDialog && (
        <AdDialog handleCancel={toggleAdDialog} handleOk={removeAd} />
      )}
    </>
  );
});
