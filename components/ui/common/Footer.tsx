import React from "react";
import NextLink from "next/link";

export const Footer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={className}>
      <div className="content has-text-centered">
        <p>
          「なろう」および「小説家になろう」は株式会社ヒナプロジェクトの登録商標です。
        </p>
        <p>
          当サービスは
          <a
            href="https://twitter.com/narou_riel"
            target="_blank"
            rel="noreferrer"
          >
            なろう系VTuberリイエル
          </a>
          が運営しており、データの取得には
          <a href="https://dev.syosetu.com/" target="_blank" rel="noreferrer">
            なろうデベロッパーAPI
          </a>
          を利用しております。
        </p>
        <p>
          運営者は、本サービスの利用による利用者の不利益・損害に関して一切の責任を負わないものとします。
        </p>
        <p>
          <NextLink href="/about">このサイトについて</NextLink>
        </p>
      </div>
    </footer>
  );
};
