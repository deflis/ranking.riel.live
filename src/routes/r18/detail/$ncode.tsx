import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useR18DetailForView } from "@/modules/data/r18item";

import { prefetchR18Detail } from "@/modules/data/r18item";

export const Route = createFileRoute("/r18/detail/$ncode")({
	loader: async ({ context: { queryClient }, params: { ncode } }) => {
		await prefetchR18Detail(queryClient, ncode);
	},
	component: R18DetailPage,
});

function R18DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} isR18={true} />;
}
