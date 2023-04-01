import { useAtomValue } from "jotai";
import AdSense from "./AdSense";
import { countAtom } from "../../../modules/atoms/global";

let localCount = 0;

export const FirstAd: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // show ads only on first view
  const count = useAtomValue(countAtom);

  if (count > 0 && localCount === 0) {
    localCount++;
    return <>{children ?? <AdSense />}</>;
  }
  return null;
};
