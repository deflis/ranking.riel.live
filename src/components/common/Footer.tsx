import React from "react";
import { Link } from "react-router-dom";
import { OutboundLink } from "react-ga";

export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="content has-text-centered">
      <p>
        「なろう」および「小説家になろう」は株式会社ヒナプロジェクトの登録商標です。
      </p>
      <p>
        当サービスは
        <OutboundLink
          eventLabel="footer"
          to="https://twitter.com/narou_riel"
          target="_blank"
        >
          なろう系VTuberリイエル
        </OutboundLink>
        が運営しており、データの取得には
        <OutboundLink
          eventLabel="footer"
          to="https://dev.syosetu.com/"
          target="_blank"
        >
          なろうデベロッパーAPI
        </OutboundLink>
        を利用しております。
      </p>
      <p>
        運営者は、本サービスの利用による利用者の不利益・損害に関して一切の責任を負わないものとします。
      </p>
      <p>
        <Link to="/about">このサイトについて</Link>
      </p>
    </div>
  </footer>
);
