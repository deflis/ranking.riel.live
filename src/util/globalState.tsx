import React, { useReducer, createContext, useContext } from "react";
import { useLocalStorage } from "react-use";

interface GlobalState {
  adMode: boolean;
}
type Action = { type: "TOGGLE_AD_MODE" };

const DispatchContext = createContext<[GlobalState, React.Dispatch<Action>]>([
  { adMode: true },
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

export const GlobalStateProvider: React.FC = ({ children }) => {
  const [adMode, setAdMode] = useLocalStorage("useAd", true);

  const stateReducer: React.Reducer<GlobalState, Action> = (state, action) => {
    switch (action.type) {
      case "TOGGLE_AD_MODE":
        const newAdModeValue = !state.adMode;
        setAdMode(newAdModeValue);
        return {
          ...state,
          adMode: newAdModeValue,
        };
      default:
        throw new Error();
    }
  };

  const reducer = useReducer(stateReducer, { adMode: adMode ?? true });

  return (
    <DispatchContext.Provider value={reducer}>
      {children}
    </DispatchContext.Provider>
  );
};

export default GlobalStateProvider;
