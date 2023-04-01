import { DateTime } from "luxon";
import { RankingType } from "narou/src/index.browser";

import { formatDate } from "../utils/date";

export const rankingPath = (type: RankingType, date?: DateTime) =>
  `/ranking/${type}/${date ? formatDate(date, type) : ""}`;
