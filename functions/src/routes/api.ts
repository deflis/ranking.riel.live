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
import { NovelType } from "narou/dist/params";

const router = Router();

type RankingParams = {
  date: string;
  type: RankingType;
};

router.get(
  "/ranking/:type/:date",
  async (req: Request<RankingParams>, res: Response<RankingResult[]>) => {
    try {
      const date = parseISO(req.params.date);
      const rankingData = await ranking()
        .date(date)
        .type(req.params.type)
        .executeWithFields();

      res.set("Cache-Control", "public, max-age=300, s-maxage=600");
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
      const searchResultAsync = search().ncode(ncode).execute();
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

      res.set("Cache-Control", "public, max-age=300, s-maxage=600");
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
  filter: (r: NarouSearchResult) => boolean
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
  } while (result.length < 300 && page < 10);
  return result;
}

type CustomParams = {
  order: Order;
};
type CustomQueryParams = {
  keyword: string;
  genres: string;
  type: NovelType;
};

router.get(
  "/custom/:order",
  async (req: Request<CustomParams, any, any, CustomQueryParams>, res: Response<RankingResult[]>) => {
    try {
      const order = req.params.order;
      const { keyword, genres, type } = req.query;

      const searchBuilder = search();
      searchBuilder.order(order).limit(500);

      if (keyword) {
        searchBuilder.word(keyword).byKeyword(true);
      }
      if (genres) {
        const genre: Genre[] = genres.split(",") as any;
        searchBuilder.genre(genre);
      }
      if (type) {
        searchBuilder.type(type);
      }

      const searchResult = await searchWithFilter(
        searchBuilder,
        (value) => true
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
        }
        return { ...value, rank: index + 1, pt };
      });

      res.set("Cache-Control", "public, max-age=300, s-maxage=600");
      res.json(rankingData);
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

export default router;
