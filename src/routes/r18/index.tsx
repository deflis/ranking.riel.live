import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/r18/")({
	beforeLoad: () => {
		throw redirect({
			to: "/r18/ranking/$type",
			params: {
				type: "daily",
			},
		});
	},
});
