import React from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";

import { useDetailForView } from "../../modules/data/item";
import { useR18DetailForView } from "../../modules/data/r18item";
import {
  Item,
  ItemDetail,
  NocDetail,
  NocItem,
  RankingHistories,
} from "../../modules/data/types";
import { Paper } from "../ui/atoms/Paper";
import { SelfAd } from "../ui/common/SelfAd";
import DetailItem from "../ui/detail/DetailItem";
import { RankingHistoryRender } from "../ui/detail/RankingHistoryRender";

type Result = {
  ncode: string;
  item: Item | NocItem | undefined;
  detail: ItemDetail | NocDetail | undefined;
  ranking: RankingHistories | undefined;
  isNotFound: boolean;
  isR18?: true;
};

const DetailRenderer: React.FC<Result> = ({
  ncode,
  item,
  detail,
  ranking,
  isNotFound,
  isR18,
}) => {
  return (
    <>
      <DetailItem
        ncode={ncode}
        item={item}
        detail={detail}
        isNotFound={isNotFound}
        isR18={isR18}
      />
      {ranking && <RankingHistoryRender ranking={ranking} />}
      <Paper>
        <SelfAd />
      </Paper>
    </>
  );
};

export const Detail: React.FC = () => {
  const params = useParams<{ ncode: string }>();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ncode = params.ncode!;

  const { item, detail, ranking, isLoading, error } = useDetailForView(ncode);

  useTitle(
    item
      ? `${item.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  return (
    <DetailRenderer
      ncode={ncode}
      item={item}
      detail={detail}
      ranking={ranking}
      isNotFound={(!item && !isLoading) || !!error}
    />
  );
};

export const R18Detail: React.FC = () => {
  const params = useParams<{ ncode: string }>();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ncode = params.ncode!;

  const { item, detail, isLoading, error } = useR18DetailForView(ncode);

  useTitle(
    item
      ? `${item.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  return (
    <DetailRenderer
      ncode={ncode}
      item={item}
      detail={detail}
      ranking={undefined}
      isNotFound={(!item && !isLoading) || !!error}
      isR18={true}
    />
  );
};

export default Detail;
