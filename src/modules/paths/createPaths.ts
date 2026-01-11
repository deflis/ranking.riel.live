import type { DateTime } from "luxon";
import type { RankingType } from "narou";
import { generatePath } from "react-router-dom";

import { formatDate } from "../utils/date";
export const rankingParams = (type: RankingType, date?: DateTime) => ({
  type,
  date: date ? formatDate(date, type) : undefined
});

export const rankingPath = (type: RankingType, date?: DateTime) => generatePath(
  "/ranking/:type?/:date?", {
  type,
  date: date ? formatDate(date, type) : null
}
)