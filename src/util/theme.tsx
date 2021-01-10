import React from "react";
import {
  MuiThemeProvider,
  createMuiTheme,
  ThemeOptions,
  Theme,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";

import { useDarkMode, useShowKeyword, useTitleHeight } from "./globalState";
declare module "@material-ui/core/styles/createMuiTheme" {
  interface Theme {
    ranking: {
      titleHeight: number;
      showKeyword: boolean;
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    ranking?: {
      titleHeight?: number;
      showKeyword?: boolean;
    };
  }
}
const theme: ThemeOptions = {
  typography: {
    fontFamily: ['"Noto Sans JP"', "sans-serif"].join(","),
  },
};

const lightTheme = createMuiTheme(
  {
    palette: {
      type: "light",
      primary: blue,
      secondary: red,
    },
  },
  theme
);

const darkTheme = createMuiTheme(
  {
    palette: {
      type: "dark",
      primary: {
        main: blue[100],
      },
      secondary: {
        main: red[100],
      },
    },
  },
  theme
);

const MyThemeProvider: React.FC = ({ children }) => {
  const [darkmode] = useDarkMode();
  const [titleHeight] = useTitleHeight();
  const [showKeyword] = useShowKeyword();

  const currentTheme: Theme = {
    ...(darkmode ? darkTheme : lightTheme),
    ranking: {
      titleHeight,
      showKeyword,
    },
  };

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
export default MyThemeProvider;
