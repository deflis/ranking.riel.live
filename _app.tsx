import { DateTime, Settings } from "luxon";
import { RankingType, search } from "narou/src/index.browser";

import {
  DefaultGenerics,
  Outlet,
  parseSearchWith,
  ReactLocation,
  Route,
  Router,
  stringifySearchWith,
} from "@tanstack/react-location";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { Layout } from "./components/Layout";
import CustomRanking from "./components/templates/custom";
import Detail from "./components/templates/detail";
import Ranking from "./components/templates/ranking";
import { prefetchDetail, prefetchRanking } from "./modules/data/prefetch";
import { useCustomTheme } from "./modules/theme/theme";
import { convertDate } from "./modules/utils/date";
import { persister } from "./modules/utils/persister";
import { useAtomValue, useSetAtom } from "jotai";
import { countAtom, darkModeAtom } from "./modules/atoms/global";
import { useEffect } from "react";

Settings.defaultZone = "Asia/Tokyo";
Settings.defaultLocale = "ja";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});
const location = new ReactLocation({
  parseSearch: parseSearchWith((search) => search),
  stringifySearch: stringifySearchWith((search: any) => String(search)),
});
const routes: Route<DefaultGenerics>[] = [
  {
    path: "/",
    element: <Ranking />,
    loader: () => {
      prefetchRanking(
        queryClient,
        RankingType.Daily,
        convertDate(
          DateTime.now().minus({ hour: 12 }).startOf("day"),
          RankingType.Daily
        )
      );
      return {};
    },
  },
  {
    path: "ranking",
    children: [
      {
        path: ":type",
        children: [
          {
            path: "/",
            element: <Ranking />,
            loader: ({ params: { type } }) => {
              prefetchRanking(
                queryClient,
                type as RankingType,
                convertDate(
                  DateTime.now().minus({ hour: 12 }).startOf("day"),
                  type as RankingType
                )
              );
              return {};
            },
          },
          {
            path: ":date",
            element: <Ranking />,
            loader: ({ params: { date, type } }) => {
              prefetchRanking(
                queryClient,
                type as RankingType,
                convertDate(DateTime.fromISO(date), type as RankingType)
              );
              return {};
            },
          },
        ],
      },
    ],
  },
  {
    path: "detail/:ncode",
    element: <Detail />,
    loader: async ({ params: { ncode } }) => {
      await prefetchDetail(queryClient, ncode);
      return {};
    },
  },
  {
    path: "custom",
    element: <CustomRanking />,
    children: [
      {
        path: ":type",
        element: <CustomRanking />,
      },
    ],
  },
];

const AppInside: React.FC<React.PropsWithChildren> = ({ children }) => {
  useCustomTheme();
  const setCount = useSetAtom(countAtom);
  useEffect(() => setCount((count) => (count ?? 0) + 1), [setCount]);
  const darkmode = useAtomValue(darkModeAtom);

  return <Layout isDark={darkmode}>{children}</Layout>;
};

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Router location={location} routes={routes}>
        <AppInside>
          <Outlet />
        </AppInside>
      </Router>
    </PersistQueryClientProvider>
  );
}

export default App;
