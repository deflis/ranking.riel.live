import { NarouSearchResult } from "narou/src/index.browser";
import React from "react";
import { useTitle } from "react-use";

import DetailItem from "../ui/detail/DetailItem";
import FakeItem from "../ui/detail/FakeItem";
import { RankingHistoryRender } from "../ui/detail/RankingHistoryRender";
import { SelfAd } from "../ui/common/SelfAd";
import { AdAmazonWidth } from "../ui/common/AdAmazon";
import AdSense from "../ui/common/AdSense";
import { RankingHistories } from "../../modules/interfaces/RankingHistory";
import { useMatch } from "@tanstack/react-location";
import { useDetailForView } from "../../modules/data/queries/item";

type Result = {
  detail: NarouSearchResult;
  ranking: RankingHistories;
};

const DetailRenderer: React.FC<Result> = ({ detail, ranking }) => {
  return (
    <>
      <DetailItem item={detail} />
      <RankingHistoryRender ranking={ranking} />
      <Paper className={""}>
        <SelfAd />
      </Paper>
    </>
  );
};

const Detail: React.FC = () => {
  const {
    params: { ncode },
  } = useMatch<{ Params: { ncode: string } }>();

  const { data, isLoading } = useDetailForView(ncode);

  useTitle(
    data
      ? `${data.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  if (loading) {
    return <FakeItem />;
  } else if (result) {
    return <DetailRenderer {...result} />;
  }
  return (
    <>
      <AdAmazonWidth />
      <Alert severity="warning">
        情報が見つかりません。この小説は削除された可能性があります。
      </Alert>
      <AdSense />
    </>
  );
};
export default Detail;
