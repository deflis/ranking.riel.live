import { DateTime } from "luxon";

export const NarouDateFormat = "yyyy-MM-dd hh:mm:ss";

export const parse = (date: string | undefined) =>
  date
    ? DateTime.fromFormat(date, NarouDateFormat, {
        zone: "Asia/Tokyo",
      })
    : undefined;
