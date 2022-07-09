import DataLoader from "dataloader";
import { NarouNovelJsonp } from "narou";
import { NarouSearchResult } from "narou";
import { search } from "narou";

export const detailLoader = new DataLoader<string, NarouSearchResult, string>(
  async (ncodes) => {
    const { values } = await search(undefined, new NarouNovelJsonp())
      .ncode(ncodes as string[])
      .limit(ncodes.length)
      .opt("weekly")
      .execute();
    return ncodes
      .map((x) => x.toLowerCase())
      .map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
  },
  {
    cache: false,
    maxBatchSize: 500,
  }
);

export default detailLoader;
