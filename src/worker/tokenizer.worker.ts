import { RankingResult } from "narou";
import { tokenizeTitle } from "../util/kuromoji";
import { expose } from "comlink";

export default {} as typeof Worker & { new (): Worker };


const tokenizeTitleByGenre = async (ranking: RankingResult[]) => {
  return await tokenizeTitle(ranking);
};

const api = {
  tokenizeTitleByGenre,
};

expose(api);

export type TokenizerApi = typeof api;
