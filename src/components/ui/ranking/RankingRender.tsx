import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import type { NarouRankingResult } from "narou";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Waypoint } from "react-waypoint";

import { adModeAtom } from "../../../modules/atoms/global";
import { prefetchRankingDetail } from "../../../modules/data/prefetch";
import { chunk } from "../../../modules/utils/chunk";
import { Button } from "../atoms/Button";
import { DotLoader } from "../atoms/Loader";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";

import RankingItem from "./RankingItem";

const ChunkRender: React.FC<{
	chunk: React.ReactNode;
	isTail: boolean;
	setMax: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chunk, setMax, isTail }) => {
	const handleMore = useCallback(() => {
		setMax((max) => (isTail ? max + 10 : max));
	}, [setMax, isTail]);
	const adMode = useAtomValue(adModeAtom);

	return (
		<>
			{chunk}
			{adMode && (
				<div className="col-span-full	p-auto">
					<AdAmazonWidth />
				</div>
			)}
			{isTail && (
				<Waypoint onEnter={handleMore}>
					<div className="col-span-full px-20 pt-10 pb-20">
						<Button onClick={handleMore} className="w-full h-20 text-3xl">
							もっと見る
						</Button>
					</div>
				</Waypoint>
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
			// biome-ignore lint/suspicious/noArrayIndexKey: chunkのindexをkeyとしている
			key={i}
		/>
	));
	const rankingConstants = useMemo(
		() => ranking.map(({ ncode, pt }) => `${ncode}${pt}`).join(),
		[ranking],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: ランキングが変わったときにリセットする
	useEffect(() => {
		setMax(10);
	}, [rankingConstants]);

	const queryClient = useQueryClient();
	// biome-ignore lint/correctness/useExhaustiveDependencies: queryClientは変わらないので入れない
	useEffect(() => {
		prefetchRankingDetail(
			queryClient,
			ranking.slice(max, max + 10).map((x) => x.ncode),
		);
	}, [ranking, max]);
	const adMode = useAtomValue(adModeAtom);

	return (
		<div className="w-full grid md:grid-cols-2 p-4 gap-4">
			{adMode && (
				<div className="col-span-full">
					<AdSense />
				</div>
			)}
			{renderItems}
			<div className="col-span-full">
				<SelfAd />
			</div>
			<div className="col-span-full">
				<AdSense />
			</div>
		</div>
	);
};

export const RankingRender: React.FC<{
	ranking: NarouRankingResult[];
	loading?: boolean;
}> = ({ ranking, loading = false }) => {
	return (
		<>
			{loading && ranking.length === 0 && <DotLoader />}
			{!loading && ranking.length === 0 && <p>データがありません</p>}
			<InsideRender ranking={ranking} />
		</>
	);
};
