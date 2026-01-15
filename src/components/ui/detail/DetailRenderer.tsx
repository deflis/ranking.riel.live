import {
	useDetailForItem,
	useItemForListing,
	useRankingHistory,
} from "@/modules/data/item";
import {
	useR18DetailForItem,
	useR18ItemForListing,
} from "@/modules/data/r18item";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DotLoader } from "../atoms/Loader";
import { Paper } from "../atoms/Paper";
import { ErrorFallback } from "../common/ErrorFallback";
import { SelfAd } from "../common/SelfAd";
import DetailItem from "./DetailItem";
import { RankingHistoryRender } from "./RankingHistoryRender";
import { ClientOnly } from "@tanstack/react-router";

const DetailItemContent: React.FC<{
	ncode: string;
	isR18?: boolean;
}> = ({ ncode, isR18 }) => {
	const { data: item } = isR18
		? useR18ItemForListing(ncode)
		: useItemForListing(ncode);
	const { data: detail } = isR18
		? useR18DetailForItem(ncode)
		: useDetailForItem(ncode);

	return (
		<DetailItem
			ncode={ncode}
			item={item}
			detail={detail}
			isNotFound={!item}
			isR18={isR18 ? true : undefined}
		/>
	);
};

const RankingHistoryContent: React.FC<{
	ncode: string;
}> = ({ ncode }) => {
	const { data: ranking } = useRankingHistory(ncode);
	return <RankingHistoryRender ranking={ranking} />;
};



export const DetailRenderer: React.FC<{
	ncode: string;
	isR18?: boolean;
}> = ({ ncode, isR18 }) => {
	return (
		<>
			<QueryErrorResetBoundary>
				{({ reset }) => (
					<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
						<Suspense fallback={<DotLoader />}>
							<DetailItemContent ncode={ncode} isR18={isR18} />
						</Suspense>
					</ErrorBoundary>
				)}
			</QueryErrorResetBoundary>

			{!isR18 && (
				<ClientOnly>
					<QueryErrorResetBoundary>
						{({ reset }) => (
							<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
								<Suspense fallback={<DotLoader />}>
									<RankingHistoryContent ncode={ncode} />
								</Suspense>
							</ErrorBoundary>
						)}
					</QueryErrorResetBoundary>
				</ClientOnly>
			)}

			<Paper>
				<SelfAd />
			</Paper>
		</>
	);
};
