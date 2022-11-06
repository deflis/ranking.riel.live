import { Settings } from "luxon";

import { Outlet, Route, Routes, BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { Layout } from "./components/Layout";
import CustomRanking from "./components/templates/custom";
import Detail from "./components/templates/detail";
import Ranking from "./components/templates/ranking";
import { useCustomTheme } from "./modules/theme/theme";
import { persister } from "./modules/utils/persister";
import { useSetAtom } from "jotai";
import { countAtom } from "./modules/atoms/global";
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
            <Route path="/ranking/:type" element={<Ranking />} />
            <Route path="/ranking/:type/:date" element={<Ranking />} />
            <Route path="/detail/:ncode" element={<Detail />} />
            <Route path="/custom" element={<CustomRanking />} />
            <Route path="/custom/:type" element={<CustomRanking />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
