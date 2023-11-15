import { useAtomValue } from "jotai";
import React, { useEffect } from "react";

import { adModeAtom } from "../../../modules/atoms/global";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    adsbygoogle: Array<unknown>;
  }
}

export const AdSense: React.FC = () => {
  const adMode = useAtomValue(adModeAtom);
  return adMode ? <InnerAdSense /> : null;
};

export const InnerAdSense: React.FC = () => {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.error(e);
    }
  }, []);
  const location = useLocation();

  return (
    <div className="text-center" key={location.key}>
      <ins
        className="adsbygoogle block"
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-6809573064811153"
        data-ad-slot="3138091970"
      />
    </div>
  );
};

export default AdSense;
