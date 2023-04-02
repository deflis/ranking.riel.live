import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import DataLoader from "dataloader";
import { DateTime } from "luxon";
import {
  NarouSearchResults,
  NovelTypeParam,
  PickedNarouSearchResult,
  R18Site,
  searchR18,
  R18Fields,
  NarouSearchResult,
} from "narou";
import { useCallback } from "react";

import { parseDateRange } from "../atoms/filter";
import { R18RankingParams } from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";
import { parse } from "../utils/NarouDateFormat";
import { chunk } from "../utils/chunk";

import {
  RankingData,
  convertOrder,
  formatCustomRankingRaw,
} from "./custom/utils";
import { prefetchRankingDetail } from "./prefetch";

const PAGE_ITEM_NUM = 10 as const;
const CHUNK_ITEM_NUM = 100 as const;

export const useR18Ranking = (params: R18RankingParams, page: number) => {
  const queryClient = useQueryClient();

  const { isLoading, data } = useQuery({
    queryKey: [params, page],
    queryFn: useCallback(getCustomRankingQueryFn(params, queryClient), [
      params,
    ]),
  });
  return { isLoading, data };
};

export const prefetchR18Ranking = async (
  queryClient: QueryClient,
  params: R18RankingParams,
  page: number
) => {
  await queryClient.prefetchQuery(
    [params, page],
    getCustomRankingQueryFn(params, queryClient)
  );
  const ranking = queryClient.getQueryData<RankingData[]>([params, page]);
  await prefetchRankingDetail(queryClient, ranking?.map((x) => x.ncode) ?? []);
};

const getCustomRankingQueryFn = (
  params: R18RankingParams,
  queryClient: QueryClient
): QueryFunction<RankingData[], readonly [R18RankingParams, number]> => {
  const filterBuilder = new FilterBuilder();
  const firstUpdate = parseDateRange(params.firstUpdate);
  if (params.max) filterBuilder.setMaxNo(params.max);
  if (params.min) filterBuilder.setMaxNo(params.min);
  if (firstUpdate) filterBuilder.setFirstUpdate(firstUpdate);
  if (!params.tanpen) filterBuilder.disableTanpen();
  if (!params.kanketsu) filterBuilder.disableKanketsu();
  if (!params.rensai) filterBuilder.disableRensai();
  const filter = filterBuilder.create();
  const fields = filterBuilder.fields();

  return async ({ queryKey: [params, page] }) => {
    const values: PickedNarouSearchResult<CustomRankingResultKeyNames>[] = [];
    let fetchPage = 0;
    while (values.length < page * CHUNK_ITEM_NUM) {
      const result = await queryClient.fetchQuery({
        queryKey: customRankingKey(params, fields, fetchPage),
        queryFn: customRankingFetcher,
      });
      const resultValues = result.values.filter(filter);
      values.push(...resultValues);
      fetchPage++;
      if (result.allcount < fetchPage * CHUNK_ITEM_NUM) {
        break;
      }
    }
    return formatCustomRankingRaw(params.rankingType, values).slice(
      (page - 1) * PAGE_ITEM_NUM,
      page * PAGE_ITEM_NUM
    );
  };
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
  params: R18RankingParams,
  fields: R18Fields[],
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
    sites,
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
  let newFields: R18Fields[] = [R18Fields.ncode];
  let optionalFields: "weekly"[] = [];
  switch (rankingType) {
    case RankingType.Daily:
      newFields = [R18Fields.ncode, R18Fields.daily_point];
      optionalFields = [];
      break;
    case RankingType.Weekly:
      newFields = [R18Fields.ncode, R18Fields.weekly_point];
      optionalFields = [];
      break;
    case RankingType.Monthly:
      newFields = [R18Fields.ncode, R18Fields.monthly_point];
      optionalFields = [];
      break;
    case RankingType.Quarter:
      newFields = [R18Fields.ncode, R18Fields.quarter_point];
      optionalFields = [];
      break;
    case RankingType.Yearly:
      newFields = [R18Fields.ncode, R18Fields.yearly_point];
      optionalFields = [];
      break;
    case RankingType.All:
      newFields = [R18Fields.ncode, R18Fields.all_hyoka_cnt];
      optionalFields = [];
      break;
    case RankingType.UniqueUser:
      newFields = [R18Fields.ncode];
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
    sites.length === 0
      ? [
          R18Site.Nocturne,
          R18Site.MoonLight,
          R18Site.MoonLightBL,
          R18Site.Midnight,
        ]
      : sites,
    novelTypeParam,
    [...fields, ...newFields] as const,
    optionalFields,
    page,
  ] as const;
};
type CustomRankingKey = ReturnType<typeof customRankingKey>;

type NarouCustomRankingSearchResults = NarouSearchResults<
  NarouSearchResult,
  CustomRankingResultKeyNames
>;
const customRankingFetcher: QueryFunction<
  NarouCustomRankingSearchResults,
  CustomRankingKey
> = async ({
  queryKey: [
    ,
    order,
    keyword,
    notKeyword,
    byTitle,
    byStory,
    sites,
    novelTypeParam,
    fields,
    optionalFields,
    page,
  ],
}) => {
  const searchBuilder = searchR18()
    .order(order)
    .page(page, CHUNK_ITEM_NUM)
    .fields([
      R18Fields.ncode,
      R18Fields.general_all_no,
      R18Fields.general_firstup,
      R18Fields.noveltype,
      R18Fields.end,
      R18Fields.daily_point,
      R18Fields.weekly_point,
      R18Fields.monthly_point,
      R18Fields.monthly_point,
      R18Fields.quarter_point,
      R18Fields.yearly_point,
      R18Fields.all_hyoka_cnt,
    ])
    .opt("weekly");

  searchBuilder.fields(fields);
  searchBuilder.opt(optionalFields);

  if (sites.length > 0) {
    searchBuilder.r18Site(sites);
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
  private tanpen = true;
  private rensai = true;
  private kanketsu = true;

  private execute(item: T): boolean {
    if (this.maxNo && item.general_all_no > this.maxNo) {
      return false;
    }
    if (this.minNo && item.general_all_no < this.minNo) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  fields(): R18Fields[] {
    const fields = new Set<R18Fields>();
    if (this.maxNo || this.minNo) {
      fields.add(R18Fields.general_all_no);
    }
    if (this.firstUpdate) {
      fields.add(R18Fields.general_firstup);
    }
    if (this.rensai || this.kanketsu) {
      fields.add(R18Fields.noveltype);
      fields.add(R18Fields.end);
    }
    if (this.tanpen) {
      fields.add(R18Fields.noveltype);
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
