import { Router } from "express";
import { ranking, RankingType } from "narou";
import { parseISO } from "date-fns";

const router = Router();

router.get("/:type/:date", async (req, res) => {
  try {
    const date = parseISO(req.params.date);
    const rankingData = await ranking()
      .date(date)
      .type(req.params.type as RankingType)
      .executeWithFields();

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json(rankingData);
  } catch (e) {
    res.status(500).json(e);
  }
});

export default router;
