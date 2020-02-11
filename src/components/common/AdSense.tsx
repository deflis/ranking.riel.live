import React, { useLayoutEffect } from "react";

export const AdSense = () => {
    useLayoutEffect(() => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-format="fluid"
      data-ad-layout-key="-fb+5w+4e-db+86"
      data-ad-client="ca-pub-6809573064811153"
      data-ad-slot="3138091970"
      data-adtest="on"
    ></ins>
  );
};

export default AdSense;
