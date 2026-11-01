import { QueryClient } from "@tanstack/react-query";
import { Link, createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Provider, createStore } from "jotai";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	// SSRではリクエストごと、ブラウザーではルーターの存続中に共有する。
	const atomStore = createStore();
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 10 * 60 * 1000,
				gcTime: 10 * 60 * 1000,
				refetchOnMount: false,
				refetchOnReconnect: false,
				refetchOnWindowFocus: false,
			},
		},
	});

	const router = createRouter({
		routeTree,
		Wrap: ({ children }) => <Provider store={atomStore}>{children}</Provider>,
		context: {
			queryClient,
		},
		defaultPreload: "intent",
		scrollRestoration: true,

		defaultNotFoundComponent: () => {
			return (
				<div>
					<p>Not found!</p>
					<Link to="/">Go home</Link>
				</div>
			);
		},
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		handleRedirects: true,
		wrapQueryClient: true,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
