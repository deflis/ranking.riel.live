import React from "react";
import { useTitle } from "react-use";

import { useParams } from "react-router-dom";

import { useDetailForView } from "../../modules/data/item";
import {
  Detail as DetailType,
  Item,
  ItemDetail,
  NocDetail,
  NocItem,
  RankingHistories,
} from "../../modules/data/types";
import { AdAmazonWidth } from "../ui/common/AdAmazon";
import AdSense from "../ui/common/AdSense";
import { SelfAd } from "../ui/common/SelfAd";
import DetailItem from "../ui/detail/DetailItem";
import FakeItem from "../ui/detail/FakeItem";
import { RankingHistoryRender } from "../ui/detail/RankingHistoryRender";
import { Paper } from "../ui/atoms/Paper";

type Result = {
  ncode: string;
  item: Item | NocItem | undefined;
  detail: DetailType | NocDetail | undefined;
  ranking: RankingHistories | undefined;
  isNotFound: boolean;
};

const DetailRenderer: React.FC<Result> = ({
  ncode,
  item,
  detail,
  ranking,
  isNotFound,
}) => {
  return (
    <>
      <DetailItem
        ncode={ncode}
        item={item}
        detail={detail}
        isNotFound={isNotFound}
      />
      {ranking && <RankingHistoryRender ranking={ranking} />}
      <Paper>
        <SelfAd />
      </Paper>
    </>
  );
};

const Detail: React.FC = () => {
  const { ncode } = useParams<{ ncode: string }>();

  const { item, detail, ranking, isLoading, error } = useDetailForView(ncode!);

  useTitle(
    item
      ? `${item.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  return (
    <DetailRenderer
      ncode={ncode!}
      item={item}
      detail={detail}
      ranking={ranking}
      isNotFound={(!item && !isLoading) || !!error}
    />
  );
};
export default Detail;
