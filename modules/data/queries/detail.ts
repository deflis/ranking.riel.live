import { NarouSearchResult } from "narou";
import { QueryFunction, useQuery } from "react-query";
import detailLoader from "../loaders/detail";

export const detailKey = (ncode: string) =>
  ["detail", ncode.toLowerCase()] as const;
export const detailFetcher: QueryFunction<
  NarouSearchResult | undefined,
  ReturnType<typeof detailKey>
> = async ({ queryKey: [, ncode] }) => await detailLoader.load(ncode);

export const useDetail = (ncode: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: detailKey(ncode),
    queryFn: detailFetcher,
  });
  return { data, isLoading, error };
};
