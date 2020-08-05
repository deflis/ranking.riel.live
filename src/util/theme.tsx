import React, { useCallback, useEffect, useContext } from "react";
import {
  MuiThemeProvider,
  createMuiTheme,
  ThemeOptions,
} from "@material-ui/core";
import { useLocalStorage } from "react-use";
import CssBaseline from "@material-ui/core/CssBaseline";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";

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
const DispatchContext = React.createContext<[boolean, () => void]>([
  false,
  () => {
    throw new Error();
  },
]);

export function useToggleDarkMode(): [boolean, () => void] {
  return useContext(DispatchContext);
}

const MyThemeProvider: React.FC = ({ children }) => {
  const [darkmode, setDarkmode] = useLocalStorage("darkmode", false);
  const toggleDarkmode = useCallback(() => {
    setDarkmode((x) => !x);
  }, [setDarkmode]);

  const currentTheme = darkmode ? darkTheme : lightTheme;
  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <DispatchContext.Provider value={[darkmode ?? false, toggleDarkmode]}>
        {children}
      </DispatchContext.Provider>
    </MuiThemeProvider>
  );
};
export default MyThemeProvider;
