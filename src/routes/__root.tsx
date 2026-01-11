import { createRootRouteWithContext } from "@tanstack/react-router";
import {
	Outlet,
	ScrollRestoration,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Suspense, useEffect } from "react";
import { Settings } from "luxon";
import { useSetAtom } from "jotai";

import { Layout } from "@/components/Layout";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { countAtom } from "@/modules/atoms/global";
import { useCustomTheme } from "@/modules/theme/theme";
import { persister } from "@/modules/utils/persister";

import "@/index.css";

Settings.defaultZone = "Asia/Tokyo";
Settings.defaultLocale = "ja";

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
			<PersistQueryClientProvider
				client={Route.useRouteContext().queryClient}
				persistOptions={{ persister }}
			>
				<Layout>
					<Suspense fallback={<DotLoader />}>
						<Outlet />
					</Suspense>
				</Layout>
			</PersistQueryClientProvider>
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
				<ScrollRestoration />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
