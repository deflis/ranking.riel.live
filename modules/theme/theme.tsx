import { useEffect } from "react";

import { darkModeAtom } from "../atoms/global";
import { useAtomValue } from "jotai";

export const useCustomTheme: () => void = () => {
  const darkmode = useAtomValue(darkModeAtom);
  useEffect(() => {
    if (darkmode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-mode", "light");
    }
  }, [darkmode]);
};
