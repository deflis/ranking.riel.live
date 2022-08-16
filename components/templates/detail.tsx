import React from "react";
import { useTitle } from "react-use";

import DetailItem from "../ui/detail/DetailItem";
import FakeItem from "../ui/detail/FakeItem";
import { RankingHistoryRender } from "../ui/detail/RankingHistoryRender";
import { SelfAd } from "../ui/common/SelfAd";
import { AdAmazonWidth } from "../ui/common/AdAmazon";
import AdSense from "../ui/common/AdSense";
import { useMatch } from "@tanstack/react-location";
import { useDetailForView } from "../../modules/data/item";
import { ItemDetail, RankingHistories } from "../../modules/data/types";

type Result = {
  detail: ItemDetail;
  ranking: RankingHistories;
};

const DetailRenderer: React.FC<Result> = ({ detail, ranking }) => {
  return (
    <>
      <DetailItem item={detail} />
      <RankingHistoryRender ranking={ranking} />
      {/*<Paper className={""}>
        <SelfAd />
  </Paper> */}
    </>
  );
};

const Detail: React.FC = () => {
  const {
    params: { ncode },
  } = useMatch<{ Params: { ncode: string } }>();

  const { item, ranking, isLoading } = useDetailForView(ncode);

  useTitle(
    item
      ? `${item.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  if (isLoading) {
    return <FakeItem />;
  } else if (item && ranking) {
    return <DetailRenderer detail={item} ranking={ranking} />;
  }
  return (
    <>
      <AdAmazonWidth />
      <div>情報が見つかりません。この小説は削除された可能性があります。</div>
      <AdSense />
    </>
  );
};
export default Detail;
