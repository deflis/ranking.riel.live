import { parseFromTimeZone } from 'date-fns-timezone';

export const NarouDateFormat = "YYYY-MM-DD hh:mm:ss";

export const parse = (date: string) =>
  parseFromTimeZone(date, NarouDateFormat, {
    timeZone: "Asia/Tokyo",
  });