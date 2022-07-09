import { DateTime } from "luxon";

export const NarouDateFormat = "yyyy-MM-dd hh:mm:ss";

export const parse = (date: string) =>
  DateTime.fromFormat(date ?? "", NarouDateFormat, {
    zone: "Asia/Tokyo",
  });
