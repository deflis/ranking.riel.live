import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useCustomRanking } from "../../../modules/data/custom";
import type { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { DotLoader } from "../atoms/Loader";
import AdSense from "../common/AdSense";
import { ErrorFallback } from "../common/ErrorFallback";
import { SelfAd } from "../common/SelfAd";
import { LoadMore } from "./LoadMore";
import RankingItem from "./RankingItem";

const InsideRender: React.FC<{
	params: CustomRankingParams;
	page: number;
	isTail: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ params, page, isTail, setPage }) => {
	const handleMore = () => {
		setPage((max) => (isTail ? max + 1 : max));
	};
	const { data } = useCustomRanking(params, page);
	if (data?.length === 0 || !data) {
		return page === 1 ? <div className="w-full">データがありません</div> : null;
	}
	return (
		<>
			{data.map((item) => (
				<RankingItem key={`${item.rank}-${item.ncode}`} item={item} />
			))}
			<AdSense className="col-span-full" />
			{isTail && <LoadMore onLoadMore={handleMore} />}
		</>
	);
};

export const CustomRankingRender: React.FC<{
	params: CustomRankingParams;
}> = ({ params }) => {
	const [page, setPage] = useState(1);

	useEffect(() => {
		setPage(1);
		// oxlint-disable-next-line react/exhaustive-deps -- paramsが変わったときにリセットする
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
