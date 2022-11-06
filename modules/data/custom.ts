import { DateTime } from "luxon";
import {
  Fields,
  NarouSearchResults,
  NovelTypeParam,
  PickedNarouSearchResult,
  search,
} from "narou/src/index.browser";
import { useCallback, useMemo } from "react";

import { QueryFunction, useQuery, useQueryClient } from "@tanstack/react-query";

import { CustomRankingParams } from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";
import { parse } from "../utils/NarouDateFormat";
import {
  convertOrder,
  formatCustomRankingRaw,
  RankingData,
} from "./custom/utils";
import { allGenres } from "../enum/Genre";

const PAGE_ITEM_NUM = 10 as const;

export const useCustomRankingMaxPage = (params: CustomRankingParams) => {
  const fields = useMemo(() => {
    const filterBuilder = new FilterBuilder();
    if (params.max) filterBuilder.setMaxNo(params.max);
    if (params.min) filterBuilder.setMaxNo(params.min);
    if (params.firstUpdate) filterBuilder.setFirstUpdate(params.firstUpdate);
    if (!params.tanpen) filterBuilder.disableTanpen();
    if (!params.kanketsu) filterBuilder.disableKanketsu();
    if (!params.rensai) filterBuilder.disableRensai();
    return filterBuilder.fields();
  }, [
    params.max,
    params.min,
    params.firstUpdate,
    params.tanpen,
    params.kanketsu,
    params.rensai,
  ]);
  const { data } = useQuery({
    queryKey: customRankingKey(params, fields, 0),
    queryFn: customRankingFetcher,
  });
  return data && data?.allcount < 2000
    ? Math.floor(data.allcount / PAGE_ITEM_NUM)
    : 200;
};

export const useCustomRanking = (params: CustomRankingParams, page: number) => {
  const [filter, fields] = useMemo(() => {
    const filterBuilder = new FilterBuilder();
    if (params.max) filterBuilder.setMaxNo(params.max);
    if (params.min) filterBuilder.setMaxNo(params.min);
    if (params.firstUpdate) filterBuilder.setFirstUpdate(params.firstUpdate);
    if (!params.tanpen) filterBuilder.disableTanpen();
    if (!params.kanketsu) filterBuilder.disableKanketsu();
    if (!params.rensai) filterBuilder.disableRensai();
    return [filterBuilder.create(), filterBuilder.fields()] as const;
  }, [
    params.max,
    params.min,
    params.firstUpdate,
    params.tanpen,
    params.kanketsu,
    params.rensai,
  ]);
  const queryClient = useQueryClient();
  const queryFn: QueryFunction<
    RankingData[],
    readonly [CustomRankingParams, number]
  > = useCallback(
    async ({ queryKey: [params, page] }) => {
      const values: PickedNarouSearchResult<CustomRankingResultKeyNames>[] = [];
      let fetchPage = 0;
      while (values.length < page * PAGE_ITEM_NUM) {
        const result = await queryClient.fetchQuery({
          queryKey: customRankingKey(params, fields, fetchPage),
          queryFn: customRankingFetcher,
        });
        const resultValues = result.values.filter(filter);
        values.push(...resultValues);
        fetchPage++;
        if (result.allcount < fetchPage * PAGE_ITEM_NUM) {
          break;
        }
      }
      return formatCustomRankingRaw(params.rankingType, values).slice(
        (page - 1) * 10,
        page * 10
      );
    },
    [queryClient, fields]
  );
  const { isLoading, data } = useQuery({
    queryKey: [params, page] as const,
    queryFn,
  });
  return { isLoading, data };
};

type CustomRankingResultKeyNames =
  | "ncode"
  | "general_all_no"
  | "general_firstup"
  | "noveltype"
  | "end"
  | "daily_point"
  | "weekly_point"
  | "monthly_point"
  | "quarter_point"
  | "yearly_point"
  | "all_hyoka_cnt"
  | "weekly_unique";

const customRankingKey = (
  params: CustomRankingParams,
  fields: Fields[],
  page: number
) => {
  const {
    rankingType,
    keyword,
    notKeyword,
    byTitle,
    byStory,
    rensai,
    kanketsu,
    tanpen,
    genres,
  } = params;
  let novelTypeParam: NovelTypeParam | null = null;
  if (!tanpen) {
    novelTypeParam = NovelTypeParam.Rensai;
  }
  if (!rensai) {
    if (!tanpen) {
      novelTypeParam = NovelTypeParam.RensaiEnd;
    } else {
      novelTypeParam = NovelTypeParam.ShortAndRensai;
    }
  }
  if (!kanketsu) {
    if (!tanpen) {
      novelTypeParam = NovelTypeParam.RensaiNow;
    }
  }
  let newFields: Fields[] = [Fields.ncode];
  let optionalFields: "weekly"[] = [];
  switch (rankingType) {
    case RankingType.Daily:
      newFields = [Fields.ncode, Fields.daily_point];
      optionalFields = [];
      break;
    case RankingType.Weekly:
      newFields = [Fields.ncode, Fields.weekly_point];
      optionalFields = [];
      break;
    case RankingType.Monthly:
      newFields = [Fields.ncode, Fields.monthly_point];
      optionalFields = [];
      break;
    case RankingType.Quarter:
      newFields = [Fields.ncode, Fields.quarter_point];
      optionalFields = [];
      break;
    case RankingType.Yearly:
      newFields = [Fields.ncode, Fields.yearly_point];
      optionalFields = [];
      break;
    case RankingType.All:
      newFields = [Fields.ncode, Fields.all_hyoka_cnt];
      optionalFields = [];
      break;
    case RankingType.UniqueUser:
      newFields = [Fields.ncode];
      optionalFields = ["weekly"];
      break;
  }
  return [
    "custom",
    convertOrder(rankingType),
    keyword,
    notKeyword,
    byTitle,
    byStory,
    genres.length === 0 ? allGenres : genres,
    novelTypeParam,
    [...fields, ...newFields] as const,
    optionalFields,
    page,
  ] as const;
};
type NarouCustomRankingSearchResults =
  NarouSearchResults<CustomRankingResultKeyNames>;
const customRankingFetcher: QueryFunction<
  NarouCustomRankingSearchResults,
  ReturnType<typeof customRankingKey>
> = async ({
  queryKey: [
    ,
    order,
    keyword,
    notKeyword,
    byTitle,
    byStory,
    genres,
    novelTypeParam,
    fields,
    optionalFields,
    page,
  ],
}) => {
  const searchBuilder = search()
    .order(order)
    .page(page, 10)
    .fields([
      Fields.ncode,
      Fields.general_all_no,
      Fields.general_firstup,
      Fields.noveltype,
      Fields.end,
      Fields.daily_point,
      Fields.weekly_point,
      Fields.monthly_point,
      Fields.monthly_point,
      Fields.quarter_point,
      Fields.yearly_point,
      Fields.all_hyoka_cnt,
    ])
    .opt("weekly");

  searchBuilder.fields(fields);
  searchBuilder.opt(optionalFields);

  if (genres.length > 0) {
    searchBuilder.genre(genres);
  }
  if (keyword) {
    searchBuilder.word(keyword).byKeyword(true);
  }
  if (notKeyword) {
    searchBuilder.notWord(notKeyword).byKeyword(true);
  }
  if (byTitle) {
    searchBuilder.byTitle(byTitle);
  }
  if (byStory) {
    searchBuilder.byOutline();
  }
  if (novelTypeParam) {
    searchBuilder.type(novelTypeParam);
  }
  return await searchBuilder.execute();
};

class FilterBuilder<
  T extends PickedNarouSearchResult<
    "general_all_no" | "general_firstup" | "noveltype" | "end"
  >
> {
  private maxNo?: number;
  private minNo?: number;
  private firstUpdate?: DateTime;
  private tanpen: boolean = true;
  private rensai: boolean = true;
  private kanketsu: boolean = true;

  private execute(item: T): boolean {
    if (this.maxNo && item.general_all_no > this.maxNo) {
      return false;
    }
    if (this.minNo && item.general_all_no < this.minNo) {
      return false;
    }
    if (this.firstUpdate && this.firstUpdate < parse(item.general_firstup)!) {
      return false;
    }
    switch (item.noveltype) {
      case 1:
        switch (item.end) {
          case 1:
            return this.rensai;
          default:
          case 0:
            return this.kanketsu;
        }
      default:
      case 2:
        return this.tanpen;
    }
  }

  fields(): Fields[] {
    const fields = new Set<Fields>();
    if (this.maxNo || this.minNo) {
      fields.add(Fields.general_all_no);
    }
    if (this.firstUpdate) {
      fields.add(Fields.general_firstup);
    }
    if (this.rensai || this.kanketsu) {
      fields.add(Fields.noveltype);
      fields.add(Fields.end);
    }
    if (this.tanpen) {
      fields.add(Fields.noveltype);
    }
    return Array.from(fields);
  }

  setMaxNo(maxNo: number) {
    this.maxNo = maxNo;
  }
  setMinNo(minNo: number) {
    this.minNo = minNo;
  }
  setFirstUpdate(firstUpdate: DateTime) {
    this.firstUpdate = firstUpdate;
  }
  disableTanpen() {
    this.tanpen = false;
  }
  disableRensai() {
    this.rensai = false;
  }
  disableKanketsu() {
    this.kanketsu = false;
  }

  create(): (item: T) => boolean {
    return (item) => this.execute(item);
  }
}
