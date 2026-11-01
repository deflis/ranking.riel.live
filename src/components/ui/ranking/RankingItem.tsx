import { Transition } from "@headlessui/react";
import { Link, createLink } from "@tanstack/react-router";
import { decode } from "html-entities";
import { useAtomValue } from "jotai";
import { GenreNotation, R18SiteNotation } from "narou";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useToggle } from "@/hooks/useToggle";
import { showKeywordAtom, titleHeightAtom } from "@/modules/atoms/global";
import { useItemForListing } from "@/modules/data/item";
import { useR18ItemForListing } from "@/modules/data/r18item";
import type { Item, NocItem } from "@/modules/data/types";
import type { RankingResultItem } from "@/modules/interfaces/RankingResultItem";
import { RankingType } from "@/modules/interfaces/RankingType";
import {
	buildCustomRankingSearch,
	buildR18RankingSearch,
} from "@/modules/utils/parseSearch";
import {
	nowInTokyo,
	parseDateTime,
	formatDateTime,
	formatRelative,
} from "@/modules/utils/temporal";

import { Button } from "../atoms/Button";
import { Chip } from "../atoms/Chip";
import { PulseLoader } from "../atoms/Loader";
import { Paper } from "../atoms/Paper";
import ItemBadge from "../common/badges/ItemBadge";
import { Tag, Tags } from "../common/bulma/Tag";

const ChipLink = createLink(Chip);

const lineClamp = [
	"",
	"line-clamp-1",
	"line-clamp-2",
	"line-clamp-3",
	"line-clamp-4",
	"line-clamp-5",
	"line-clamp-6",
	"line-clamp-7",
	"line-clamp-8",
	"line-clamp-9",
	"line-clamp-10",
];

function checkR18(
	isR18: boolean,
	item: Item | NocItem | null | undefined,
): item is NocItem {
	return isR18 && (item == null || (item as NocItem)?.nocgenre !== undefined);
}
const RankingItemRender: React.FC<{
	className?: string;
	ncode: string;
	rankingItem: RankingResultItem;
	item: Item | NocItem | null | undefined;
	isR18?: true;
	isPending: boolean;
	isError: boolean;
}> = ({
	className,
	ncode,
	rankingItem,
	item,
	isError,
	isPending,
	isR18: rawR18 = false,
}) => {
	const titleHeight = useAtomValue(titleHeightAtom);
	const showKeyword = useAtomValue(showKeywordAtom);

	const [openStory, toggleStory] = useToggle(false);

	const isR18 = checkR18(rawR18, item);
	const isNotfound = (!item && !isPending) || isError;

	const link = isR18
		? `https://novel18.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`
		: `https://ncode.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`;
	const detail = isR18 ? "/r18/detail/$ncode" : "/detail/$ncode";
	const detailParams = {
		ncode: item?.ncode ?? ncode,
	} as const;

	const novelupdatedAt = item?.novelupdated_at
		? parseDateTime(item.novelupdated_at)
		: null;
	const generalFirstup = item?.general_firstup
		? parseDateTime(item.general_firstup)
		: null;
	const generalLastup = item?.general_lastup
		? parseDateTime(item.general_lastup)
		: null;
	const generalFirstupDiffDays = generalFirstup
		? (generalFirstup.epochMilliseconds - nowInTokyo().epochMilliseconds) /
			86_400_000
		: null;

	return (
		<div
			className={[
				className,
				"box-border grid grid-rows-subgrid gap-2",
				"row-span-8",
				"p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700",
			]
				.filter(Boolean)
				.join(" ")}
			suppressHydrationWarning
		>
			<p>
				第{rankingItem.rank}位{" "}
				<Tags>
					<Tag>{rankingItem.pt?.toLocaleString()}pt</Tag>
					{generalFirstupDiffDays !== null && generalFirstupDiffDays <= 30 && (
						<Tag tagColor="red" light={generalFirstupDiffDays <= 7}>
							New!
						</Tag>
					)}
				</Tags>
			</p>
			<p>
				{item ? (
					<>
						<ItemBadge item={item} />
						{!isR18 && (
							<Link
								to="/custom/{-$type}"
								params={(prev) => ({ ...prev, type: RankingType.Daily })}
								search={(_) =>
									buildCustomRankingSearch({ genres: [item.genre] })
								}
							>
								{GenreNotation[item.genre]}
							</Link>
						)}
						{isR18 && (
							<Link
								to="/r18/ranking/{-$type}"
								params={(prev) => ({ ...prev, type: RankingType.Daily })}
								search={(_) =>
									buildR18RankingSearch({ sites: [item.nocgenre] })
								}
							>
								{R18SiteNotation[item.nocgenre]}
							</Link>
						)}
						<Tag>
							{Math.round(item.length / item.general_all_no).toLocaleString()}
							文字/話
						</Tag>
					</>
				) : (
					<PulseLoader disabled={isNotfound} />
				)}
			</p>
			<h2 className="mb-2 text-2xl">
				<Link
					to={detail}
					params={detailParams}
					title={decode(item?.title)}
					className={[
						"link-reset text-gray-800 dark:text-white hover:underline",
						titleHeight > 0 && `${lineClamp[titleHeight]} overflow-ellipsis`,
					]
						.filter(Boolean)
						.join(" ")}
				>
					{item ? (
						decode(item.title)
					) : isNotfound ? (
						"この小説は見つかりません"
					) : (
						<PulseLoader className="h-6" disabled={isNotfound} />
					)}
				</Link>
			</h2>

			<p>
				作者:{" "}
				{item ? (
					isR18 ? (
						decode(item.writer)
					) : (
						<a
							href={`https://mypage.syosetu.com/${encodeURIComponent(item.userid)}/`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{decode(item.writer)}
						</a>
					)
				) : (
					<PulseLoader className="w-1/4" disabled={isNotfound} />
				)}
			</p>
			<p>
				更新日時:{" "}
				{novelupdatedAt ? (
					formatDateTime(novelupdatedAt)
				) : (
					<PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
				)}
			</p>
			<p>
				掲載開始:{" "}
				{generalFirstup ? (
					formatRelative(generalFirstup)
				) : (
					<PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
				)}{" "}
				/ 最終更新:{" "}
				{generalLastup ? (
					formatRelative(generalLastup)
				) : (
					<PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
				)}
			</p>
			<Paper
				className={[
					"p-2 space-2 bg-gray-50 dark:bg-zinc-900",
					!showKeyword && "hidden",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{item?.keyword
					.split(/\s/g)
					.filter((keyword) => keyword)
					.map((keyword) => (
						<ChipLink
							key={keyword}
							to={isR18 ? "/r18/ranking/{-$type}" : "/custom/{-$type}"}
							params={(prev) => ({ ...prev, type: RankingType.Daily })}
							search={{ keyword }}
						>
							{keyword}
						</ChipLink>
					)) ?? <PulseLoader disabled={isNotfound} />}
			</Paper>

			<div className="space-y-2">
				{item && (
					<Transition
						show={openStory}
						enter="transition duration-100 origin-top ease-out"
						enterFrom="transform scale-75 scale-y-0 opacity-0 "
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 origin-top ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-75 opacity-0"
						as={Paper}
						className="bg-gray-100 p-2 whitespace-pre-wrap text-sm dark:bg-zinc-900 box-content"
					>
						{item.story}
					</Transition>
				)}
				<div className="flex space-x-2 items-center">
					{item && (
						<Button onClick={toggleStory}>
							あらすじを{openStory ? "隠す" : "表示"}
						</Button>
					)}
					<div className="grow" />
					<Link to={detail} params={detailParams}>
						小説情報
					</Link>
					<Button
						as="a"
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						title={decode(item?.title)}
					>
						読む
					</Button>
				</div>
			</div>
		</div>
	);
};

const RankingItemContent: React.FC<{
	rankingItem: RankingResultItem;
	className?: string;
}> = ({ rankingItem, className }) => {
	const { data: item } = useItemForListing(rankingItem.ncode);
	return (
		<RankingItemRender
			className={className}
			ncode={rankingItem.ncode}
			item={item}
			rankingItem={rankingItem}
			isPending={false}
			isError={false}
		/>
	);
};

export const RankingItem: React.FC<{
	item: RankingResultItem;
	className?: string;
}> = ({ item: rankingItem, className }) => {
	return (
		<ErrorBoundary
			fallback={
				<RankingItemRender
					className={className}
					ncode={rankingItem.ncode}
					item={undefined}
					rankingItem={rankingItem}
					isPending={false}
					isError={true}
				/>
			}
		>
			<Suspense
				fallback={
					<RankingItemRender
						className={className}
						ncode={rankingItem.ncode}
						item={undefined}
						rankingItem={rankingItem}
						isPending={true}
						isError={false}
					/>
				}
			>
				<RankingItemContent rankingItem={rankingItem} className={className} />
			</Suspense>
		</ErrorBoundary>
	);
};

const R18RankingItemContent: React.FC<{
	rankingItem: RankingResultItem;
	className?: string;
}> = ({ rankingItem, className }) => {
	const { data: item } = useR18ItemForListing(rankingItem.ncode);
	return (
		<RankingItemRender
			className={className}
			isR18={true}
			ncode={rankingItem.ncode}
			item={item}
			rankingItem={rankingItem}
			isPending={false}
			isError={false}
		/>
	);
};

export const R18RankingItem: React.FC<{
	item: RankingResultItem;
	className?: string;
}> = ({ item: rankingItem, className }) => {
	return (
		<ErrorBoundary
			fallback={
				<RankingItemRender
					className={className}
					isR18={true}
					ncode={rankingItem.ncode}
					item={undefined}
					rankingItem={rankingItem}
					isPending={false}
					isError={true}
				/>
			}
		>
			<Suspense
				fallback={
					<RankingItemRender
						className={className}
						isR18={true}
						ncode={rankingItem.ncode}
						item={undefined}
						rankingItem={rankingItem}
						isPending={true}
						isError={false}
					/>
				}
			>
				<R18RankingItemContent
					rankingItem={rankingItem}
					className={className}
				/>
			</Suspense>
		</ErrorBoundary>
	);
};

export default RankingItem;
