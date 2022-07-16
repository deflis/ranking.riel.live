import { QueryFunction, useQueries, useQuery } from "react-query";
import { itemLoader, ItemResult } from "../loaders/items";

export const itemKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
  ItemResult | undefined,
  ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const itemDetailKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
  ItemResult | undefined,
  ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const useItemForListing = (ncode: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: itemKey(ncode),
    queryFn: itemFetcher,
  });
  return { data, isLoading, error };
};

export const useDetailForView = (ncode: string) => {
  const [listing, others] = useQueries([
    {
      queryKey: itemKey(ncode),
      queryFn: itemFetcher,
    },
    {
      queryKey: itemDetailKey(ncode),
      queryFn: itemDetailFetcher,
    },
  ]);
  return {
    data: { ...listing.data, ...others.data },
    isLoading: listing.isLoading || listing.isLoading,
    error: listing.error && others.error,
  };
};
