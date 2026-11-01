import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { CatchBoundary } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";

import { useR18Ranking } from "../../../modules/data/r18ranking";
import type { R18RankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { DotLoader } from "../atoms/Loader";
import AdSense from "../common/AdSense";
import { ErrorFallback } from "../common/ErrorFallback";
import { SelfAd } from "../common/SelfAd";
import { LoadMore } from "./LoadMore";
import { R18RankingItem } from "./RankingItem";

const InsideRender: React.FC<{
	params: R18RankingParams;
	page: number;
	isTail: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ params, page, isTail, setPage }) => {
	const handleMore = () => {
		setPage((max) => (isTail ? max + 1 : max));
	};
	const { data } = useR18Ranking(params, page);
	if (data?.length === 0 || !data) {
		return page === 1 ? <div className="w-full">データがありません</div> : null;
	}
	return (
		<>
			{data.map((item) => (
				<R18RankingItem key={`${item.rank}-${item.ncode}`} item={item} />
			))}
			<AdSense className="col-span-full" />
			{isTail && <LoadMore onLoadMore={handleMore} />}
		</>
	);
};

export const R18RankingRender: React.FC<{
	params: R18RankingParams;
}> = ({ params }) => {
	const [page, setPage] = useState(1);

	useEffect(() => {
		setPage(1);
		// oxlint-disable-next-line react/exhaustive-deps -- paramsが変わったときにリセットする
	}, [params]);

	const pages = Array.from({ length: page }, (_, i) => i + 1);
	const renderItems = pages.map((currentPage) => (
		<QueryErrorResetBoundary key={currentPage}>
			<CatchBoundary getResetKey={() => ""} errorComponent={ErrorFallback}>
				<Suspense fallback={<DotLoader />}>
					<InsideRender
						params={params}
						page={currentPage}
						isTail={currentPage === page && page < 200}
						setPage={setPage}
					/>
				</Suspense>
			</CatchBoundary>
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
