import React from "react";
import { FaCog } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Paper } from "../ui/atoms/Paper";

import { SelfAd } from "../ui/common/SelfAd";

const About: React.FC = () => {
  return (
    <div className="space-y-4">
      <Paper className="bg-white p-4 space-y-4 dark:bg-gray-800">
        <h2 className="text-2xl font-bold">このサイトについて</h2>
        <section className="space-y-2">
          <p>
            本サービス「なろうランキングビューワ」は
            <Link to="https://twitter.com/narou_riel">
              なろう系VTuberリイエル
            </Link>
            が運営しております。
            （本サービスは小説家になろうとは直接的には無関係であり、本サービスは株式会社ヒナプロジェクトが提供するものではありません。）
          </p>
          <p>
            本サービスは小説家になろうのページでは提供されない「なろうデベロッパーAPI」のデータを見やすい形で提供することを目的としております。
            皆様のスコップライフが充実することを祈って本サービスを作っております。要望等があればTwitter等でお気軽にお問い合わせください。
          </p>
        </section>
      </Paper>
      <Paper className="bg-white p-4 space-y-4 dark:bg-gray-800">
        <h2 className="text-2xl font-bold">おすすめの使い方</h2>
        <section className="space-y-2">
          <p>
            <Link to="/">ランキング</Link>
            ではフィルターをクリックし、最大話数を指定することができます。
            これによってまだ投稿されている話数が多くない小説のみを読むことができます。
            こちらのフィルターはブラウザごとに記録されており、次の閲覧時に再度反映されるようになっています。
          </p>
          <p>
            <Link to="/custom">カスタムランキング</Link>
            では、右上の「
            <FaCog className="inline" />
            編集」ボタンをクリックすることによりランキングをカスタマイズすることができます。
            例えば、
            <Link to="/custom?keyword=悪役令嬢">悪役令嬢</Link>や
            <Link to="/custom?keyword=VRMMO">VRMMO</Link>
            のランキングを作ったりすることができます。
            ぜひカスタマイズして、あなた好みのランキングを作ってみてください。
            いいランキングができれば共有ボタンで共有してもらえると嬉しいです。
          </p>
          <p>
            各ページはブックマークやホーム画面に追加して保存ができます。ぜひ登録してください。
          </p>
        </section>
      </Paper>
      <Paper className="bg-white p-4 space-y-4 dark:bg-gray-800">
        <section className="space-y-2">
          <p>
            データの取得には
            <Link to="https://dev.syosetu.com/">なろうデベロッパーAPI</Link>
            を利用しております。
          </p>
          <p>
            「なろう」および「小説家になろう」は株式会社ヒナプロジェクトの登録商標です。
          </p>
          <p>
            運営者は、本サービスの利用による利用者の不利益・損害に関して一切の責任を負わないものとします。
            ヒナプロジェクトが提供するものでもないため、ヒナプロジェクトへと問い合わせをすることもおやめください。
          </p>
        </section>
      </Paper>
      <Paper className="bg-white p-4 space-y-4 dark:bg-gray-800">
        <SelfAd />
      </Paper>
    </div>
  );
};

export default About;
