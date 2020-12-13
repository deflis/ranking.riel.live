import { Router, Request, Response } from "express";
import {
  ranking,
  rankingHistory,
  RankingType,
  search,
  Order,
  RankingResult,
  Genre,
  NarouSearchResult,
} from "narou";
import { parseISO, formatISO } from "date-fns";
import SearchBuilder from "narou/dist/search-builder";
import FilterBuilder from "../util/FilterBuilder";
import { NovelType } from "narou/dist/params";

const router = Router();

router.use((_, res, next) => {
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  next();
});

type RankingParams = {
  date: string;
  type: RankingType;
};

type RankingResponse = RankingResult[];

router.get(
  "/ranking/:type/:date",
  async (req: Request<RankingParams>, res: Response<RankingResponse>) => {
    try {
      const date = parseISO(req.params.date);
      const rankingData = await ranking()
        .date(date)
        .type(req.params.type)
        .executeWithFields();
      res.json(rankingData);
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

type DetailParams = {
  ncode: string;
};

type DetailResponse = {
  detail: NarouSearchResult;
  ranking: {
    [type: string]: {
      date: string;
      type: RankingType;
      pt: number;
      rank: number;
    };
  };
};

router.get(
  "/detail/:ncode",
  async (req: Request<DetailParams>, res: Response<DetailResponse>) => {
    try {
      const ncode = req.params.ncode;
      const searchResultAsync = search().ncode(ncode).opt("weekly").execute();
      const historyAsync = rankingHistory(ncode).catch((e) => {
        console.error(e);
        return [];
      });
      const [searchResult, history] = await Promise.all([
        searchResultAsync,
        historyAsync,
      ]);
      const detail = searchResult.values?.[0];

      const rankingData = Object.create(null);
      for (const type of [
        RankingType.Daily,
        RankingType.Weekly,
        RankingType.Monthly,
        RankingType.Quarterly,
      ]) {
        if (Array.isArray(history)) {
          rankingData[type] = history
            .filter((x) => x.type === type)
            .map(({ date, ...other }) => ({
              date: formatISO(date, { representation: "date" }),
              ...other,
            }));
        } else {
          rankingData[type] = [];
        }
      }

      if (detail) {
        res.json({ detail, ranking: rankingData });
      } else {
        res.status(404).json();
      }
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

async function searchWithFilter(
  searchBuilder: SearchBuilder,
  filter: (item: NarouSearchResult) => boolean
): Promise<NarouSearchResult[]> {
  let page = 0;
  let result: NarouSearchResult[] = [];
  do {
    const response = await searchBuilder.page(page, 500).execute();
    result = result.concat(response.values.filter(filter));
    page++;
    if (response.allcount < page * 500) {
      break;
    }
  } while (result.length < 300 && page < 5);
  return result;
}

type CustomParams = {
  order: Order;
};
type CustomQueryParams = {
  keyword?: string;
  not_keyword?: string;
  by_title?: string;
  by_story?: string;
  genres?: string;
  min?: string;
  max?: string;
  first_update?: string;
  rensai?: string;
  kanketsu?: string;
  tanpen?: string;
};

router.get(
  "/custom/:order",
  async (
    req: Request<CustomParams, any, any, CustomQueryParams>,
    res: Response<RankingResponse>
  ) => {
    try {
      const { order } = req.params;
      const {
        keyword,
        not_keyword,
        by_title,
        by_story,
        genres,
        min,
        max,
        first_update,
        rensai,
        kanketsu,
        tanpen,
      } = req.query;

      const searchBuilder = search();
      const filterBuilder = new FilterBuilder();
      searchBuilder.order(order).limit(500);

      if (order === Order.Weekly) {
        searchBuilder.opt("weekly");
      }
      if (keyword) {
        searchBuilder.word(keyword).byKeyword(true);
      }
      if (not_keyword) {
        searchBuilder.notWord(not_keyword).byKeyword(true);
      }
      if (by_title) {
        searchBuilder.byTitle();
      }
      if (by_story) {
        searchBuilder.byOutline();
      }
      if (genres) {
        const genre: Genre[] = genres.split(",") as any;
        searchBuilder.genre(genre);
      }
      if (max) {
        filterBuilder.setMaxNo(parseInt(max, 10));
      }
      if (min) {
        filterBuilder.setMinNo(parseInt(min, 10));
      }
      if (first_update) {
        filterBuilder.setFirstUpdate(parseISO(first_update));
      }
      if (tanpen === "0" || min) {
        searchBuilder.type(NovelType.Rensai);
        filterBuilder.disableTanpen();
      }
      if (rensai === "0") {
        if (tanpen === "0") {
          searchBuilder.type(NovelType.RensaiEnd);
        } else {
          searchBuilder.type(NovelType.ShortAndRensai);
        }
        filterBuilder.disableRensai();
      }
      if (kanketsu === "0") {
        if (tanpen === "0") {
          searchBuilder.type(NovelType.RensaiNow);
        }
        filterBuilder.disableKanketsu();
      }

      const searchResult = await searchWithFilter(
        searchBuilder,
        filterBuilder.create()
      );

      const rankingData: RankingResult[] = searchResult.map((value, index) => {
        let pt = value.global_point;
        if (order === Order.DailyPoint) {
          pt = value.daily_point;
        } else if (order === Order.WeeklyPoint) {
          pt = value.weekly_point;
        } else if (order === Order.MonthlyPoint) {
          pt = value.monthly_point;
        } else if (order === Order.QuarterPoint) {
          pt = value.quarter_point;
        } else if (order === Order.YearlyPoint) {
          pt = value.yearly_point;
        } else if (order === Order.Weekly) {
          pt = value.weekly_unique;
        }
        return { ...value, rank: index + 1, pt };
      });

      res.json(rankingData);
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

export default router;
