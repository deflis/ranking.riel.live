import React, { useMemo } from "react";

import { AdAmazonWidth } from "./AdAmazon";
import AdSense from "./AdSense";

export const AdRandomWidth: React.FC = () => {
  const rand = useMemo(() => Math.random(), []);
  return rand < 0.5 ? <AdSense /> : <AdAmazonWidth />;
};
