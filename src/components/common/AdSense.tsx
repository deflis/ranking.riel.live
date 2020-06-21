import React from "react";
import { useMount } from "react-use";
import { useAdMode } from "../../util/globalState";

declare global {
  interface Window {
    adsbygoogle: Array<any>;
  }
}

export const AdSense: React.FC = () => {
  const [adMode] = useAdMode();
  return adMode ? <InnerAdSense /> : null;
};

export const InnerAdSense = React.memo(() => {
  useMount(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error(e);
    }
  });
  return (
    <div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-6809573064811153"
        data-ad-slot="3138091970"
      />
    </div>
  );
});

export default AdSense;
