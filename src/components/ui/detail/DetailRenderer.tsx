import { Paper } from "../atoms/Paper";
import { SelfAd } from "../common/SelfAd";
import DetailItem from "./DetailItem";
import { RankingHistoryRender } from "./RankingHistoryRender";
import type {
  Item,
  ItemDetail,
  NocDetail,
  NocItem,
  RankingHistories,
} from "@/modules/data/types";

type Result = {
  ncode: string;
  item: Item | NocItem | undefined;
  detail: ItemDetail | NocDetail | undefined;
  ranking: RankingHistories | undefined;
  isNotFound: boolean;
  isR18?: true;
};

export const DetailRenderer: React.FC<Result> = ({
  ncode,
  item,
  detail,
  ranking,
  isNotFound,
  isR18,
}: Result) => {
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
