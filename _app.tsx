import * as React from "react";
import { useCustomTheme } from "./modules/theme/theme";
import { Provider, useAtomValue } from "jotai";
import { queryClientAtom } from "jotai/query";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Layout } from "./components/Layout";
import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { Ranking } from "./components/templates/ranking";
export type PropsDehydratedState = {
  dehydratedState?: unknown;
};

const AppInside: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queryClient = useAtomValue(queryClientAtom);
  queryClient.defaultQueryOptions({
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });

  const theme = useCustomTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

const location = new ReactLocation();

function App() {
  return (
    // Build our routes and render our router
    <Router location={location} routes={[{ path: "/", element: <Ranking /> }]}>
      <Provider>
        <AppInside>
          <Outlet />
        </AppInside>
      </Provider>
    </Router>
  );
}

export default App;
