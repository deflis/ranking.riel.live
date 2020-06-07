import React, { useReducer, useEffect, useContext } from "react";
import {
  MuiThemeProvider,
  createMuiTheme,
  ThemeOptions,
} from "@material-ui/core";
import { useLocalStorage } from "react-use";
import CssBaseline from "@material-ui/core/CssBaseline";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import { mergeObjects } from "./mergeObjects";

const theme: ThemeOptions = {
  typography: {
    fontFamily: ['"Noto Sans JP"', "sans-serif"].join(","),
  },
};
const lightTheme: ThemeOptions = {
  palette: {
    primary: blue,
    secondary: red,
  },
};
const darkTheme: ThemeOptions = {
  palette: {
    primary: {
      main: blue[100],
    },
    secondary: {
      main: red[100],
    },
  },
};

interface ThemeState {
  darkmode: boolean;
}
type Action = { type: "TOGGLE_DARKMODE" };

const themeReducer: React.Reducer<ThemeState, Action> = (state, action) => {
  switch (action.type) {
    case "TOGGLE_DARKMODE":
      return {
        darkmode: !state.darkmode,
      };
    default:
      throw new Error();
  }
};

const DispatchContext = React.createContext<[boolean, React.Dispatch<Action>]>([
  false,
  () => {
    throw new Error();
  },
]);

export function useToggleDarkMode(): [boolean, () => void] {
  const [value, dispatch] = useContext(DispatchContext);
  return [
    value,
    React.useCallback(() => dispatch({ type: "TOGGLE_DARKMODE" }), [dispatch]),
  ];
}

const MyThemeProvider: React.FC = ({ children }) => {
  const [initDarkmode, setDarkmode] = useLocalStorage("darkmode", false);
  const [{ darkmode }, dispatch] = useReducer(themeReducer, {
    darkmode: initDarkmode ?? false,
  });
  useEffect(() => {
    setDarkmode(darkmode);
  }, [darkmode, setDarkmode]);

  const currentTheme = React.useMemo(() => {
    return createMuiTheme(
      mergeObjects(theme, darkmode ? darkTheme : lightTheme, {
        palette: {
          type: darkmode ? "dark" : "light",
        },
      })
    );
  }, [darkmode]);
  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <DispatchContext.Provider value={[darkmode, dispatch]}>
        {children}
      </DispatchContext.Provider>
    </MuiThemeProvider>
  );
};
export default MyThemeProvider;
