import React from "react";
import RouterLink from "next/link";
import { FaCog } from "react-icons/fa";
import { OutboundLink, OutboundLinkProps } from "react-ga";
import { Typography, Paper, Link, styled } from "@mui/material";
import { SelfAd } from "../ui/common/SelfAd";

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
}));

const About: React.FC = () => {
  return (
    <>
      <StyledPaper>
        <Typography variant="h2">このサイトについて</Typography>
        <section>
          <Typography paragraph>
            本サービス「なろうランキングビューワ」は
            <OutboundLink
              eventLabel="About"
              to="https://twitter.com/narou_riel"
            >
              なろう系VTuberリイエル
            </OutboundLink>
            が運営しております。
            （本サービスは小説家になろうとは直接的には無関係であり、本サービスは株式会社ヒナプロジェクトが提供するものではありません。）
          </Typography>
          <Typography paragraph>
            本サービスは小説家になろうのページでは提供されない「なろうデベロッパーAPI」のデータを見やすい形で提供することを目的としております。
            皆様のスコップライフが充実することを祈って本サービスを作っております。要望等があればTwitter等でお気軽にお問い合わせください。
          </Typography>
        </section>
      </StyledPaper>
      <StyledPaper>
        <Typography variant="h2">おすすめの使い方</Typography>
        <section>
          <Typography paragraph>
            <RouterLink href="/">
              <Link>ランキング</Link>
            </RouterLink>
            ではフィルターをクリックし、最大話数を指定することができます。
            これによってまだ投稿されている話数が多くない小説のみを読むことができます。
            こちらのフィルターはブラウザごとに記録されており、次の閲覧時に再度反映されるようになっています。
          </Typography>
          <Typography paragraph>
            <RouterLink href="/custom" passHref>
              <Link>カスタムランキング</Link>
            </RouterLink>
            では、右上の「
            <FaCog />
            編集」ボタンをクリックすることによりランキングをカスタマイズすることができます。
            例えば、
            <RouterLink href="/custom?keyword=悪役令嬢" passHref>
              <Link component="a">悪役令嬢</Link>
            </RouterLink>
            や
            <RouterLink href="/custom?keyword=VRMMO" passHref>
              <Link>VRMMO</Link>
            </RouterLink>
            のランキングを作ったりすることができます。
            ぜひカスタマイズして、あなた好みのランキングを作ってみてください。
            いいランキングができれば共有ボタンで共有してもらえると嬉しいです。
          </Typography>
          <Typography paragraph>
            各ページはブックマークやホーム画面に追加して保存ができます。ぜひ登録してください。
          </Typography>
        </section>
      </StyledPaper>
      <StyledPaper>
        <section>
          <Typography paragraph>
            データの取得には
            <OutboundLink eventLabel="About" to="https://dev.syosetu.com/">
              なろうデベロッパーAPI
            </OutboundLink>
            を利用しております。
            表示を高速化するために最大で10分のキャッシュをしているため、データが遅れている可能性があります。ご注意ください。
          </Typography>
          <Typography paragraph>
            「なろう」および「小説家になろう」は株式会社ヒナプロジェクトの登録商標です。
          </Typography>
          <Typography paragraph>
            運営者は、本サービスの利用による利用者の不利益・損害に関して一切の責任を負わないものとします。
            ヒナプロジェクトが提供するものでもないため、ヒナプロジェクトへと問い合わせをすることもおやめください。
          </Typography>
        </section>
      </StyledPaper>
      <StyledPaper>
        <SelfAd />
      </StyledPaper>
    </>
  );
};

export default About;
