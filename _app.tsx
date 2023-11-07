import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useSetAtom } from "jotai";
import { Settings } from "luxon";
import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { DotLoader } from "./components/ui/atoms/Loader";
import { countAtom } from "./modules/atoms/global";
import { useCustomTheme } from "./modules/theme/theme";
import { persister } from "./modules/utils/persister";

const About = React.lazy(() => import("./components/templates/about"));
const CustomRanking = React.lazy(() => import("./components/templates/custom"));
const Detail = React.lazy(() => import("./components/templates/detail"));
const Ranking = React.lazy(() => import("./components/templates/ranking"));
const R18Detail = React.lazy(() => import("./components/templates/r18Detail"));
const R18Dialog = React.lazy(() => import("./components/ui/common/R18Dialog"));
const R18Ranking = React.lazy(() => import("./components/templates/r18"));

Settings.defaultZone = "Asia/Tokyo";
Settings.defaultLocale = "ja";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
                <Suspense fallback={<DotLoader />}>
                  <Outlet />
                </Suspense>
              </Layout>
            }
          >
            <Route index element={<Ranking />} />
            <Route path="ranking/:type" element={<Ranking />} />
            <Route path="ranking/:type/:date" element={<Ranking />} />
            <Route path="detail/:ncode" element={<Detail />} />
            <Route path="about" element={<About />} />
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
