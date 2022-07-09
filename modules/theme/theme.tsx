import React from "react";

import {
  darkModeAtom,
  showKeywordAtom,
  titleHeightAtom,
} from "../atoms/global";
import { useAtomValue } from "jotai";

export const useCustomTheme: () => void = () => {
  const darkmode = useAtomValue(darkModeAtom);
  const titleHeight = useAtomValue(titleHeightAtom);
  const showKeyword = useAtomValue(showKeywordAtom);
};
