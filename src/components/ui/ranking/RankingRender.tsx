import type { NarouRankingResult } from "narou";
import { useEffect, useState } from "react";

import { chunk } from "../../../modules/utils/chunk";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import { LoadMore } from "./LoadMore";
import RankingItem from "./RankingItem";

const ChunkRender: React.FC<{
	chunk: React.ReactNode;
	isTail: boolean;
	setMax: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chunk, setMax, isTail }) => {
	const handleMore = () => {
		setMax((max) => (isTail ? max + 10 : max));
	};
	return (
		<>
			{chunk}
			<AdSense className="col-span-full" />
			{isTail && (
				<LoadMore onLoadMore={handleMore} className="px-20 pt-10 pb-20" />
			)}
		</>
	);
};

const InsideRender: React.FC<{
	ranking: NarouRankingResult[];
}> = ({ ranking }) => {
	const [max, setMax] = useState(10);

	const rankingItems = ranking
		.slice(0, max)
		.map((item) => (
			<RankingItem key={`${item.rank}-${item.ncode}`} item={item} />
		));
	const renderItems = chunk(rankingItems, 10).map((v, i) => (
		<ChunkRender
			chunk={v}
			setMax={setMax}
			isTail={i * 10 + 10 === max}
			// oxlint-disable-next-line react/no-array-index-key -- chunkのindexをkeyとしている
			key={i}
		/>
	));
	const rankingConstants = ranking
		.map(({ ncode, pt }) => `${ncode}${pt}`)
		.join();
	useEffect(() => {
		setMax(10);
		// oxlint-disable-next-line react/exhaustive-deps -- ランキングが変わったときにリセットする
	}, [rankingConstants]);

	return (
		<div
			className="w-full grid md:grid-cols-2 p-4 gap-4"
			suppressHydrationWarning
		>
			<AdSense className="col-span-full" />
			{renderItems}
			<div className="col-span-full">
				<SelfAd />
			</div>
			<AdSense className="col-span-full" />
		</div>
	);
};

export const RankingRender: React.FC<{
	ranking: NarouRankingResult[];
}> = ({ ranking }) => {
	return (
		<>
			{ranking.length === 0 && <p>データがありません</p>}
			<InsideRender ranking={ranking} />
		</>
	);
};
