import React, { useReducer, createContext, useContext } from "react";
import { useLocalStorage } from "react-use";

interface GlobalState {
  darkmode: boolean;
  adMode: boolean;
  titleHeight: number;
  showKeyword: boolean;
}

type Action =
  | { type: "TOGGLE_AD_MODE" }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "TOGGLE_SHOW_KEYWORD" }
  | { type: "SET_TITLE_HEIGHT"; value: number };

const DispatchContext = createContext<[GlobalState, React.Dispatch<Action>]>([
  {
    darkmode: false,
    adMode: true,
    titleHeight: 0,
    showKeyword: true,
  },
  () => {
    throw new Error();
  },
]);

export function useAdMode(): [boolean, () => void] {
  const [value, dispatch] = useContext(DispatchContext);
  return [
    value.adMode,
    React.useCallback(() => dispatch({ type: "TOGGLE_AD_MODE" }), [dispatch]),
  ];
}
export function useTitleHeight(): [number, (value: number) => void] {
  const [value, dispatch] = useContext(DispatchContext);
  return [
    value.titleHeight,
    React.useCallback(
      (value: number) => dispatch({ type: "SET_TITLE_HEIGHT", value }),
      [dispatch]
    ),
  ];
}

export function useDarkMode(): [boolean, () => void] {
  const [value, dispatch] = useContext(DispatchContext);
  return [
    value.darkmode,
    React.useCallback(() => dispatch({ type: "TOGGLE_DARK_MODE" }), [dispatch]),
  ];
}

export function useShowKeyword(): [boolean, () => void] {
  const [value, dispatch] = useContext(DispatchContext);
  return [
    value.showKeyword,
    React.useCallback(() => dispatch({ type: "TOGGLE_SHOW_KEYWORD" }), [
      dispatch,
    ]),
  ];
}

const defaultDarkmode = window.matchMedia("(prefers-color-scheme: dark)")
  .matches;

export const GlobalStateProvider: React.FC = ({ children }) => {
  const [darkmode, setDarkmode] = useLocalStorage("darkmode", defaultDarkmode);
  const [adMode, setAdMode] = useLocalStorage("useAd", true);
  const [showKeyword, setShowKeyword] = useLocalStorage("showKeyword", true);
  const [titleHeight, setTiTleHeight] = useLocalStorage<number | undefined>(
    "titleHeight",
    undefined
  );

  const stateReducer: React.Reducer<GlobalState, Action> = (state, action) => {
    switch (action.type) {
      case "TOGGLE_DARK_MODE":
        const newDarkmode = !state.darkmode;
        setDarkmode(newDarkmode);
        return {
          ...state,
          darkmode: newDarkmode,
        };
      case "TOGGLE_AD_MODE":
        const newAdModeValue = !state.adMode;
        setAdMode(newAdModeValue);
        return {
          ...state,
          adMode: newAdModeValue,
        };
      case "TOGGLE_SHOW_KEYWORD":
        const newShowKeyword = !state.showKeyword;
        setShowKeyword(newShowKeyword);
        return {
          ...state,
          showKeyword: newShowKeyword,
        };
      case "SET_TITLE_HEIGHT":
        setTiTleHeight(action.value);
        return {
          ...state,
          titleHeight: action.value,
        };
      default:
        throw new Error();
    }
  };

  const reducer = useReducer(stateReducer, {
    darkmode: darkmode ?? defaultDarkmode,
    adMode: adMode ?? true,
    showKeyword: showKeyword ?? true,
    titleHeight: titleHeight ?? 0,
  });

  return (
    <DispatchContext.Provider value={reducer}>
      {children}
    </DispatchContext.Provider>
  );
};

export default GlobalStateProvider;
