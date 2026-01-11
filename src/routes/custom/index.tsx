import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/custom/")({
	beforeLoad: () => {
		throw redirect({
			to: "/custom/$type",
			params: {
				type: "d",
			},
		});
	},
});
