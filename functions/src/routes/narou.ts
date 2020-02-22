import { Router } from "express";
import { ranking, rankingHistory, RankingType, search } from "narou";
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
    const historyAsync = rankingHistory(ncode);
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
      ranking[type] = history
        .filter(x => x.type === type)
        .map(({ date, ...other }) => ({
          date: formatISO(date, { representation: "date" }),
          ...other
        }));
    }

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({ detail, ranking });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

export default router;
