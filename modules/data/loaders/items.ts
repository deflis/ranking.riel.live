import DataLoader from "dataloader";
import {
  PickedNarouSearchResult,
  DefaultSearchResultFields,
  Fields,
  search,
} from "narou/src/index.browser";

export type ItemResult = PickedNarouSearchResult<
  | "ncode"
  | "title"
  | "userid"
  | "writer"
  | "genre"
  | "noveltype"
  | "end"
  | "general_firstup"
  | "length"
  | "general_all_no"
  | "novelupdated_at"
  | "general_lastup"
  | "keyword"
  | "story"
>;

export type DetailResult = PickedNarouSearchResult<"all_hyoka_cnt">;

export const itemLoader = new DataLoader<
  string,
  ItemResult | undefined,
  string
>(
  async (ncodes) => {
    const { values } = await search()
      .ncode(ncodes as string[])
      .limit(ncodes.length)
      .fields([
        Fields.ncode,
        Fields.title,
        Fields.userid,
        Fields.writer,
        Fields.genre,
        Fields.noveltype,
        Fields.end,
        Fields.general_firstup,
        Fields.length,
        Fields.general_all_no,
        Fields.novelupdated_at,
        Fields.general_lastup,
        Fields.keyword,
        Fields.story,
      ])
      .execute();
    return ncodes
      .map((x) => x.toLowerCase())
      .map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
  },
  {
    cache: false,
    maxBatchSize: 500,
  }
);
