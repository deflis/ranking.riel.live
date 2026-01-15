import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Waypoint } from "react-waypoint";

import { adModeAtom } from "../../../modules/atoms/global";
import { useR18Ranking } from "../../../modules/data/r18ranking";
import type { R18RankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { Button } from "../atoms/Button";
import { DotLoader } from "../atoms/Loader";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";

import { ErrorFallback } from "../common/ErrorFallback";
import { R18RankingItem } from "./RankingItem";

const InsideRender: React.FC<{
	params: R18RankingParams;
	page: number;
	isTail: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ params, page, isTail, setPage }) => {
	const handleMore = useCallback(() => {
		setPage((max) => (isTail ? max + 1 : max));
	}, [setPage, isTail]);
	const { data } = useR18Ranking(params, page);
	const adMode = useAtomValue(adModeAtom);

	if (data?.length === 0 || !data) {
		return page === 1 ? <div className="w-full">データがありません</div> : null;
	}
	return (
		<>
			{data.map((item) => (
				<R18RankingItem key={`${item.rank}-${item.ncode}`} item={item} />
			))}
			{adMode && (
				<div className="col-span-full">
					<AdAmazonWidth />
				</div>
			)}
			{isTail && (
				<Waypoint onEnter={handleMore}>
					<div className="col-span-full">
						<Button onClick={handleMore} className="w-full h-20 text-3xl">
							もっと見る
						</Button>
					</div>
				</Waypoint>
			)}
		</>
	);
};

export const R18RankingRender: React.FC<{
	params: R18RankingParams;
}> = ({ params }) => {
	const [page, setPage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: paramsが変わったときにリセットする
	useEffect(() => {
		setPage(1);
	}, [params]);

	const pages = Array.from({ length: page }, (_, i) => i + 1);
	const renderItems = pages.map((currentPage) => (
		<QueryErrorResetBoundary key={currentPage}>
			{({ reset }) => (
				<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
					<Suspense fallback={<DotLoader />}>
						<InsideRender
							params={params}
							page={currentPage}
							isTail={currentPage === page && page < 200}
							setPage={setPage}
						/>
					</Suspense>
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	));

	return (
		<>
			<div className="w-full grid md:grid-cols-2 p-4 gap-4">
				{renderItems}
				<div className="col-span-full">
					<SelfAd />
				</div>
				<div className="col-span-full">
					<AdSense />
				</div>
			</div>
		</>
	);
};
