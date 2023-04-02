import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import DataLoader from "dataloader";
import { DateTime } from "luxon";
import {
  Fields,
  NarouSearchResult,
  NarouSearchResults,
  NovelTypeParam,
  PickedNarouSearchResult,
  search,
} from "narou";
import { useCallback } from "react";

import { parseDateRange } from "../atoms/filter";
import { allGenres } from "../enum/Genre";
import { CustomRankingParams } from "../interfaces/CustomRankingParams";
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

export const useCustomRanking = (params: CustomRankingParams, page: number) => {
  const queryClient = useQueryClient();

  const { isLoading, data } = useQuery({
    queryKey: [params, page],
    queryFn: useCallback(getCustomRankingQueryFn(params, queryClient), [
      params,
    ]),
  });
  return { isLoading, data };
};

export const prefetchCustomRanking = async (
  queryClient: QueryClient,
  params: CustomRankingParams,
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
  params: CustomRankingParams,
  queryClient: QueryClient
): QueryFunction<RankingData[], readonly [CustomRankingParams, number]> => {
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
    genres,
    novelTypeParam,
    fields,
    optionalFields,
    page,
  ],
}) => {
  const cacheKey = [
    order,
    keyword ?? "",
    notKeyword ?? "",
    byTitle ? "t" : "f",
    byStory ? "t" : "f",
    genres.join(),
    novelTypeParam ?? "",
    fields.join(),
    optionalFields.join(),
  ].join();
  const dataloader =
    dataLoaderCache.get(cacheKey) ??
    new DataLoader<number, NarouCustomRankingSearchResults>(
      async (pages) => {
        const min = Math.min(...pages);
        const max = Math.max(...pages);
        const searchBuilder = search()
          .order(order)
          .start(min * CHUNK_ITEM_NUM + 1)
          .limit((max - min + 1) * CHUNK_ITEM_NUM)
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
        const { allcount, values } = await searchBuilder.execute();

        return zip(pages, chunk(values, PAGE_ITEM_NUM)).map(
          ([, values], index) => ({
            allcount,
            values: values ?? [],
            limit: 10,
            start: 0,
            length: 0,
            page: index + min,
          })
        );
      },
      { cache: false }
    );

  dataLoaderCache.set(cacheKey, dataloader);

  return dataloader.load(page);
};

function zip<S1, S2>(
  firstCollection: readonly S1[],
  lastCollection: readonly S2[]
): [S1, S2 | undefined][] {
  const zipped: [S1, S2][] = [];

  for (let index = 0; index < firstCollection.length; index++) {
    zipped.push([firstCollection[index], lastCollection[index]]);
  }

  return zipped;
}

const dataLoaderCache = new Map<
  string,
  DataLoader<number, NarouCustomRankingSearchResults>
>();

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
