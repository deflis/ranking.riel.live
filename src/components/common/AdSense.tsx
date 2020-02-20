import React, { useEffect } from "react";

export const AdSense = React.memo(() => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error(e);
    }
  });
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-format="fluid"
      data-ad-layout-key="-fb+5w+4e-db+86"
      data-ad-client="ca-pub-6809573064811153"
      data-ad-slot="3138091970"
    ></ins>
  );
});

export default AdSense;
