import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { CatchBoundary, ClientOnly } from "@tanstack/react-router";
import { Suspense } from "react";

import {
	useDetailForItem,
	useItemForListing,
	useRankingHistory,
} from "@/modules/data/item";
import {
	useR18DetailForItem,
	useR18ItemForListing,
} from "@/modules/data/r18item";

import { DotLoader } from "../atoms/Loader";
import { Paper } from "../atoms/Paper";
import { ErrorFallback } from "../common/ErrorFallback";
import { SelfAd } from "../common/SelfAd";
import DetailItem from "./DetailItem";
import { RankingHistoryRender } from "./RankingHistoryRender";

const DetailItemContent: React.FC<{ ncode: string }> = ({ ncode }) => {
	const { data: item } = useItemForListing(ncode);
	const { data: detail } = useDetailForItem(ncode);
	return (
		<DetailItem ncode={ncode} item={item} detail={detail} isNotFound={!item} />
	);
};

const R18DetailItemContent: React.FC<{ ncode: string }> = ({ ncode }) => {
	const { data: item } = useR18ItemForListing(ncode);
	const { data: detail } = useR18DetailForItem(ncode);
	return (
		<DetailItem
			ncode={ncode}
			item={item}
			detail={detail}
			isNotFound={!item}
			isR18
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
				<CatchBoundary getResetKey={() => ""} errorComponent={ErrorFallback}>
					<Suspense fallback={<DotLoader />}>
						{isR18 ? (
							<R18DetailItemContent ncode={ncode} />
						) : (
							<DetailItemContent ncode={ncode} />
						)}
					</Suspense>
				</CatchBoundary>
			</QueryErrorResetBoundary>

			{!isR18 && (
				<ClientOnly>
					<QueryErrorResetBoundary>
						<CatchBoundary
							getResetKey={() => ""}
							errorComponent={ErrorFallback}
						>
							<Suspense fallback={<DotLoader />}>
								<RankingHistoryContent ncode={ncode} />
							</Suspense>
						</CatchBoundary>
					</QueryErrorResetBoundary>
				</ClientOnly>
			)}

			<Paper>
				<SelfAd />
			</Paper>
		</>
	);
};
