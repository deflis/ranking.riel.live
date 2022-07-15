import { QueryFunction, useQueries, useQuery } from "react-query";
import detailLoader, { DetailResult } from "../loaders/detail";

export const detailListingKey = (ncode: string) =>
  ["detail", ncode.toLowerCase(), "listing"] as const;
export const detailListingFetcher: QueryFunction<
  DetailResult | undefined,
  ReturnType<typeof detailListingKey>
> = async ({ queryKey: [, ncode] }) => await detailLoader.load(ncode);

export const detailOthersKey = (ncode: string) =>
  ["detail", ncode.toLowerCase(), "others"] as const;
export const detailOthersFetcher: QueryFunction<
  DetailResult | undefined,
  ReturnType<typeof detailOthersKey>
> = async ({ queryKey: [, ncode] }) => await detailLoader.load(ncode);

export const useDetailForListing = (ncode: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: detailListingKey(ncode),
    queryFn: detailListingFetcher,
  });
  return { data, isLoading, error };
};

export const useDetailForView = (ncode: string) => {
  const [listing, others] = useQueries([
    {
      queryKey: detailListingKey(ncode),
      queryFn: detailListingFetcher,
    },
    {
      queryKey: detailOthersKey(ncode),
      queryFn: detailOthersFetcher,
    },
  ]);
  return {
    data: { ...listing.data, ...others.data },
    isLoading: listing.isLoading || listing.isLoading,
    error: listing.error && others.error,
  };
};
