import { useAtomValue } from "jotai";
import React from "react";

import { countAtom } from "../../../modules/atoms/global";

import AdSense from "./AdSense";

let localCount = 0;

type FirstAdProps = { children?: React.ReactNode };

export const FirstAd: React.FC<FirstAdProps> = ({ children }: FirstAdProps) => {
  // show ads only on first view
  const count = useAtomValue(countAtom);

  if (count > 0 && localCount === 0) {
    localCount++;
    return <>{children ?? <AdSense />}</>;
  }
  return null;
};
