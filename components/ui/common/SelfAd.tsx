import Image from "next/image";
import React from "react";
import { OutboundLink } from "react-ga";
import Ad from "./ad.jpg";

export const SelfAd: React.FC = () => {
  return (
    <div className="flex justify-center">
      <OutboundLink to="https://riel.live" eventLabel="SelfAd">
        <Image className="max-w-full" src={Ad} alt="私が作りました" />
      </OutboundLink>
    </div>
  );
};
