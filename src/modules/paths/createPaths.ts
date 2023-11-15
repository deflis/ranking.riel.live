import { DateTime } from "luxon";
import { RankingType } from "narou/browser";
import { generatePath } from "react-router-dom";

import { formatDate } from "../utils/date";
import type { Params } from "@/router";

export const rankingParams = (type: RankingType, date?: DateTime): Params["/ranking/:type?/:date?"] => ({
  type,
  date: date ? formatDate(date, type) : undefined
});

export const rankingPath = (type: RankingType, date?: DateTime) => generatePath(
  "/ranking/:type?/:date?", {
  type,
  date: date ? formatDate(date, type) : null
}
)