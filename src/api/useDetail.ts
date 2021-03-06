import { NarouSearchResult } from "narou";
import useSWR from "swr";

import { RankingHistories } from "../interface/RankingHistory";
import { fetcher } from "../util/fetcher";

type Result = {
  detail: NarouSearchResult;
  ranking: RankingHistories;
};

export function useDetail(ncode: string) {
  const { data, error } = useSWR<Result>(`/_api/detail/${ncode}`, fetcher);
  const loading = !data && !error;

  return {
    result: data?.detail ? data : undefined,
    loading,
    error,
  };
}

export default useDetail;
