import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useDetailForView } from "@/modules/data/item";

export const Route = createFileRoute("/detail/$ncode")({
	component: DetailPage,
});

function DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} />;
}
