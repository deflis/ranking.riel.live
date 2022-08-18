import { useCustomTheme } from "./modules/theme/theme";
import { Provider } from "jotai";
import { queryClientAtom } from "jotai/query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Layout } from "./components/Layout";
import {
  DefaultGenerics,
  Outlet,
  ReactLocation,
  Route,
  Router,
} from "@tanstack/react-location";
import { Ranking } from "./components/templates/ranking";
import { RankingType } from "narou/src/index.browser";
import { DateTime, Settings } from "luxon";
import { convertDate } from "./modules/utils/date";
import { prefetchDetail, prefetchRanking } from "./modules/data/prefetch";
import Detail from "./components/templates/detail";

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

const location = new ReactLocation();
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
];

const AppInside: React.FC<React.PropsWithChildren> = ({ children }) => {
  useCustomTheme();

  return (
    <Layout>
      {children}
      {/* なんかdevtoolsの動作がおかしいのでコメントアウト 
      <ReactQueryDevtools />
      */}
    </Layout>
  );
};

function App() {
  return (
    <Provider initialValues={[[queryClientAtom, queryClient]]}>
      <QueryClientProvider client={queryClient}>
        <Router location={location} routes={routes}>
          <AppInside>
            <Outlet />
          </AppInside>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
