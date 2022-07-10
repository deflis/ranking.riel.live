import Image from "next/image";
import React from "react";
import Ad from "./ad.jpg";

export const SelfAd: React.FC = () => {
  return (
    <div className="flex justify-center">
      <a href="https://riel.live" target="_blank" rel="noreferrer">
        <Image className="max-w-full" src={Ad} alt="私が作りました" />
      </a>
    </div>
  );
};
