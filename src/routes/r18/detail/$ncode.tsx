import React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useR18DetailForView } from "@/modules/data/r18item";

export const Route = createFileRoute("/r18/detail/$ncode")({
	component: R18DetailPage,
});

function R18DetailPage() {
	const { ncode } = Route.useParams();

	const { item, detail, isLoading, error } = useR18DetailForView(ncode);

	return (
		<DetailRenderer
			ncode={ncode}
			item={item}
			detail={detail}
			ranking={undefined}
			isNotFound={(!item && !isLoading) || !!error}
			isR18={true}
		/>
	);
}
