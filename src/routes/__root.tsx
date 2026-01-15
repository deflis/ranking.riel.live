import type { QueryClient } from "@tanstack/react-query";
import {
	QueryClientProvider,
	QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
/// <reference types="vite/client" />
import { createRootRouteWithContext } from "@tanstack/react-router";
import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useSetAtom } from "jotai";
import { Settings } from "luxon";
import type React from "react";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Layout } from "@/components/Layout";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { ErrorFallback } from "@/components/ui/common/ErrorFallback";
import { countAtom } from "@/modules/atoms/global";
import { useCustomTheme } from "@/modules/theme/theme";

import "@/index.css";

Settings.defaultZone = "Asia/Tokyo";
Settings.defaultLocale = "ja";
Settings.throwOnInvalid = true;

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
});

function RootComponent() {
	useCustomTheme();
	const setCount = useSetAtom(countAtom);
	useEffect(() => setCount((count) => (count ?? 0) + 1), [setCount]);

	return (
		<RootDocument>
			<Layout>
				<QueryErrorResetBoundary>
					{({ reset }) => (
						<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
							<Suspense fallback={<DotLoader />}>
								<Outlet />
							</Suspense>
						</ErrorBoundary>
					)}
				</QueryErrorResetBoundary>
			</Layout>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
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
