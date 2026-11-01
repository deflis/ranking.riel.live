import type { QueryClient } from "@tanstack/react-query";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
/// <reference types="vite/client" />
import {
	CatchBoundary,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAtom } from "jotai";
import type React from "react";
import { Suspense, useEffect } from "react";

import { Layout } from "@/components/Layout";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { ErrorFallback } from "@/components/ui/common/ErrorFallback";
import { countAtom } from "@/modules/atoms/global";
import { useCustomTheme } from "@/modules/theme/theme";

import "@/index.css";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
});

function RootComponent() {
	useCustomTheme();
	// 購読による保存値の復元後に訪問回数を加算する。
	const [, setCount] = useAtom(countAtom);
	useEffect(() => setCount((count) => (count ?? 0) + 1), [setCount]);

	return (
		<RootDocument>
			<Layout>
				<QueryErrorResetBoundary>
					<CatchBoundary getResetKey={() => ""} errorComponent={ErrorFallback}>
						<Suspense fallback={<DotLoader />}>
							<Outlet />
						</Suspense>
					</CatchBoundary>
				</QueryErrorResetBoundary>
			</Layout>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<HeadContent />
			</head>
			<body>
				{children}
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
