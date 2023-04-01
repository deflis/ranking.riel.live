import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useSetAtom } from "jotai";
import { Settings } from "luxon";
import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import CustomRanking from "./components/templates/custom";
import { Detail, R18Detail } from "./components/templates/detail";
import R18Ranking from "./components/templates/r18";
import Ranking from "./components/templates/ranking";
import R18Dialog from "./components/ui/common/R18Dialog";
import { countAtom } from "./modules/atoms/global";
import { useCustomTheme } from "./modules/theme/theme";
import { persister } from "./modules/utils/persister";





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

function App() {
  useCustomTheme();
  const setCount = useSetAtom(countAtom);
  useEffect(() => setCount((count) => (count ?? 0) + 1), [setCount]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route index element={<Ranking />} />
            <Route path="ranking/:type" element={<Ranking />} />
            <Route path="ranking/:type/:date" element={<Ranking />} />
            <Route path="detail/:ncode" element={<Detail />} />
            <Route path="custom" element={<CustomRanking />} />
            <Route path="custom/:type" element={<CustomRanking />} />
            <Route
              path="r18"
              element={
                <>
                  <R18Dialog />
                  <Outlet />
                </>
              }
            >
              <Route index element={<R18Ranking />} />
              <Route path=":type" element={<R18Ranking />} />
              <Route path="detail/:ncode" element={<R18Detail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
