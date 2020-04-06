import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useQuery<
  Params extends { [K in keyof Params]?: string } = {}
>(): {
  [p in keyof Params]: string;
} {
  const location = useLocation();
  return useMemo(
    () => Object.fromEntries(new URLSearchParams(location.search).entries()) as any,
    [location]
  );
}
