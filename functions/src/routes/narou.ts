import { Router } from "express";
import {
  ranking,
  rankingHistory,
  RankingType,
  search,
  Order,
  RankingResult
} from "narou";
import { parseISO, formatISO } from "date-fns";

const router = Router();

router.get("/ranking/:type/:date", async (req, res) => {
  try {
    const date = parseISO(req.params.date);
    const rankingData = await ranking()
      .date(date)
      .type(req.params.type as RankingType)
      .executeWithFields();

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json(rankingData);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

router.get("/detail/:ncode", async (req, res) => {
  try {
    const ncode = req.params.ncode;
    const searchResultAsync = search()
      .ncode(ncode)
      .execute();
    const historyAsync = rankingHistory(ncode).catch(e => {
      console.error(e);
      return [];
    });
    const [searchResult, history] = await Promise.all([
      searchResultAsync,
      historyAsync
    ]);
    const detail = searchResult.values[0];

    const ranking = Object.create(null);
    for (const type of [
      RankingType.Daily,
      RankingType.Weekly,
      RankingType.Monthly,
      RankingType.Quarterly
    ]) {
      if (Array.isArray(history)) {
        ranking[type] = history
          .filter(x => x.type === type)
          .map(({ date, ...other }) => ({
            date: formatISO(date, { representation: "date" }),
            ...other
          }));
      } else {
        ranking[type] = [];
      }
    }

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({ detail, ranking });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

router.get("/custom/:order", async (req, res) => {
  try {
    const order = req.params.order as Order;
    const { keyword, biggenre, genre } = req.query;

    const searchBuilder = search();
    searchBuilder.order(order).limit(500);

    if (keyword) {
      searchBuilder.word(keyword).byKeyword(true);
    }
    if (biggenre) {
      searchBuilder.bigGenre(biggenre);
    }
    if (genre) {
      searchBuilder.genre(genre);
    }

    const searchResult = await searchBuilder.execute();

    const ranking: RankingResult[] = searchResult.values.map((value, index) => {
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
    res.json(ranking);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

export default router;
