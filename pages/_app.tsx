import * as React from "react";
import Head from "next/head";
import { useCustomTheme } from "../modules/theme/theme";
import { Provider, useAtomValue } from "jotai";
import { AppProps } from "next/app";
import { queryClientAtom } from "jotai/query";
import { Hydrate, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import "../styles/globals.css";
import { Layout } from "../components/Layout";

export type PropsDehydratedState = {
  dehydratedState?: unknown;
};

const App = ({ Component, pageProps }: AppProps) => {
  const queryClient = useAtomValue(queryClientAtom);
  queryClient.defaultQueryOptions({
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });

  const theme = useCustomTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate
        state={(pageProps as Partial<PropsDehydratedState>)?.dehydratedState}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ReactQueryDevtools />
      </Hydrate>
    </QueryClientProvider>
  );
};

export default App;
