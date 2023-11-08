import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useSetAtom } from "jotai";
import { Settings } from "luxon";
import React, { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { countAtom } from "@/modules/atoms/global";
import { useCustomTheme } from "@/modules/theme/theme";
import { persister } from "@/modules/utils/persister";

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
      <Layout>
        <Suspense fallback={<DotLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </PersistQueryClientProvider>
  );
}

export default App;
