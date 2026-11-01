import { Transition } from "@headlessui/react";
import { CatchBoundary, Link, createLink } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { GenreNotation, R18SiteNotation } from "narou";
import { memo, Suspense, useMemo } from "react";

import { useToggle } from "@/hooks/useToggle";
import { showKeywordAtom, titleHeightAtom } from "@/modules/atoms/global";
import { useItemForListing } from "@/modules/data/item";
import { useR18ItemForListing } from "@/modules/data/r18item";
import type { Item, NocItem } from "@/modules/data/types";
import type { RankingResultItem } from "@/modules/interfaces/RankingResultItem";
import { RankingType } from "@/modules/interfaces/RankingType";
import { decodeNarouText } from "@/modules/utils/decodeNarouText";
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

import styles from "./RankingItem.module.css";

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
type ItemFieldsProps = {
	item: Item | NocItem | null | undefined;
	ncode: string;
	isR18: boolean;
	isNotfound: boolean;
	generalFirstup: Temporal.ZonedDateTime | null;
};

const RankingItemTitle = memo(function RankingItemTitle({
	item,
	ncode,
	isR18,
	isNotfound,
}: ItemFieldsProps) {
	const titleHeight = useAtomValue(titleHeightAtom);
	const title = useMemo(() => decodeNarouText(item?.title), [item?.title]);
	const detail = isR18 ? "/r18/detail/$ncode" : "/detail/$ncode";
	const detailParams = { ncode: item?.ncode ?? ncode } as const;
	return (
		<h2 className="mb-2 text-2xl">
			<Link
				to={detail}
				params={detailParams}
				title={title}
				className={[
					"link-reset text-gray-800 dark:text-white hover:underline",
					titleHeight > 0 && `${lineClamp[titleHeight]} overflow-ellipsis`,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{item ? (
					title
				) : isNotfound ? (
					"この小説は見つかりません"
				) : (
					<PulseLoader className="h-6" disabled={isNotfound} />
				)}
			</Link>
		</h2>
	);
});

const RankingItemKeywordLinks = memo(function RankingItemKeywordLinks({
	keyword,
	isR18,
	isNotfound,
}: {
	keyword: string | undefined;
	isR18: boolean;
	isNotfound: boolean;
}) {
	const keywords = useMemo(
		() => keyword?.split(/\s/g).filter(Boolean),
		[keyword],
	);
	return (
		<>
			{keywords?.map((keyword) => (
				<ChipLink
					key={keyword}
					to={isR18 ? "/r18/ranking/{-$type}" : "/custom/{-$type}"}
					params={(prev) => ({ ...prev, type: RankingType.Daily })}
					search={{ keyword }}
				>
					{keyword}
				</ChipLink>
			)) ?? <PulseLoader disabled={isNotfound} />}
		</>
	);
});
const RankingItemKeywords = memo(function RankingItemKeywords({
	item,
	isR18,
	isNotfound,
}: ItemFieldsProps) {
	const showKeyword = useAtomValue(showKeywordAtom);
	return (
		<Paper
			className={[
				"p-2 space-2 bg-gray-50 dark:bg-zinc-900",
				!showKeyword && "hidden",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<RankingItemKeywordLinks
				keyword={item?.keyword}
				isR18={isR18}
				isNotfound={isNotfound}
			/>
		</Paper>
	);
});
const RankingItemDates = memo(function RankingItemDates({
	item,
	isNotfound,
	generalFirstup,
}: ItemFieldsProps) {
	const updatedValue = item?.novelupdated_at;
	const lastupValue = item?.general_lastup;
	const novelupdatedAt = useMemo(
		() => (updatedValue ? formatDateTime(parseDateTime(updatedValue)) : null),
		[updatedValue],
	);

	const generalLastup = useMemo(
		() => (lastupValue ? parseDateTime(lastupValue) : null),
		[lastupValue],
	);
	return (
		<>
			<p>
				更新日時:{" "}
				{novelupdatedAt ? (
					novelupdatedAt
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
		</>
	);
});
const RankingItemActions = memo(function RankingItemActions({
	item,
	ncode,
	isR18,
}: ItemFieldsProps) {
	const [openStory, toggleStory] = useToggle(false);
	const title = useMemo(() => decodeNarouText(item?.title), [item?.title]);
	const link = isR18
		? `https://novel18.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`
		: `https://ncode.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`;
	const detail = isR18 ? "/r18/detail/$ncode" : "/detail/$ncode";
	const detailParams = { ncode: item?.ncode ?? ncode } as const;
	return (
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
					<Button aria-expanded={openStory} onClick={toggleStory}>
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
					title={title}
				>
					読む
				</Button>
			</div>
		</div>
	);
});
const RankingItemAuthor = memo(function RankingItemAuthor({
	item,
	isR18: rawR18,
	isNotfound,
}: ItemFieldsProps) {
	const isR18 = checkR18(rawR18, item);
	const writer = useMemo(() => decodeNarouText(item?.writer), [item?.writer]);
	return (
		<p>
			作者:{" "}
			{item ? (
				isR18 ? (
					writer
				) : (
					<a
						href={`https://mypage.syosetu.com/${encodeURIComponent(item.userid)}/`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{writer}
					</a>
				)
			) : (
				<PulseLoader className="w-1/4" disabled={isNotfound} />
			)}
		</p>
	);
});
const RankingItemMetadata = memo(function RankingItemMetadata({
	item,
	isR18: rawR18,
	isNotfound,
}: ItemFieldsProps) {
	const isR18 = checkR18(rawR18, item);
	const length = item?.length;
	const episodes = item?.general_all_no;
	const averageLength = useMemo(
		() =>
			length !== undefined && episodes !== undefined
				? Math.round(length / episodes).toLocaleString()
				: "",
		[length, episodes],
	);
	return (
		<p>
			{item ? (
				<>
					<ItemBadge item={item} />
					{!isR18 && (
						<Link
							to="/custom/{-$type}"
							params={(prev) => ({ ...prev, type: RankingType.Daily })}
							search={(_) => buildCustomRankingSearch({ genres: [item.genre] })}
						>
							{GenreNotation[item.genre]}
						</Link>
					)}
					{isR18 && (
						<Link
							to="/r18/ranking/{-$type}"
							params={(prev) => ({ ...prev, type: RankingType.Daily })}
							search={(_) => buildR18RankingSearch({ sites: [item.nocgenre] })}
						>
							{R18SiteNotation[item.nocgenre]}
						</Link>
					)}
					<Tag>
						{averageLength}
						文字/話
					</Tag>
				</>
			) : (
				<PulseLoader disabled={isNotfound} />
			)}
		</p>
	);
});
const RankingItemRank = memo(function RankingItemRank({
	generalFirstup,
	rankingItem,
}: {
	generalFirstup: ItemFieldsProps["generalFirstup"];
	rankingItem: RankingResultItem;
}) {
	const generalFirstupDiffDays = generalFirstup
		? (generalFirstup.epochMilliseconds - nowInTokyo().epochMilliseconds) /
			86_400_000
		: null;
	const points = useMemo(
		() => rankingItem.pt?.toLocaleString(),
		[rankingItem.pt],
	);
	return (
		<p>
			第{rankingItem.rank}位{" "}
			<Tags>
				<Tag>{points}pt</Tag>
				{generalFirstupDiffDays !== null && generalFirstupDiffDays <= 30 && (
					<Tag tagColor="red" light={generalFirstupDiffDays <= 7}>
						New!
					</Tag>
				)}
			</Tags>
		</p>
	);
});

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
	const isR18 = checkR18(rawR18, item);
	const isNotfound = (!item && !isPending) || isError;
	const firstupValue = item?.general_firstup;
	const generalFirstup = useMemo(
		() => (firstupValue ? parseDateTime(firstupValue) : null),
		[firstupValue],
	);
	const fields = { item, ncode, isR18, isNotfound, generalFirstup };
	return (
		<div
			className={[
				className,
				styles.card,
				"box-border grid grid-rows-subgrid gap-2",
				"row-span-8",
				"p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700",
			]
				.filter(Boolean)
				.join(" ")}
			suppressHydrationWarning
		>
			<RankingItemRank
				generalFirstup={generalFirstup}
				rankingItem={rankingItem}
			/>
			<RankingItemMetadata {...fields} />
			<RankingItemTitle {...fields} />
			<RankingItemAuthor {...fields} />
			<RankingItemDates {...fields} />
			<RankingItemKeywords {...fields} />
			<RankingItemActions {...fields} />
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
		<CatchBoundary
			getResetKey={() => ""}
			errorComponent={() => (
				<RankingItemRender
					className={className}
					ncode={rankingItem.ncode}
					item={undefined}
					rankingItem={rankingItem}
					isPending={false}
					isError={true}
				/>
			)}
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
		</CatchBoundary>
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
		<CatchBoundary
			getResetKey={() => ""}
			errorComponent={() => (
				<RankingItemRender
					className={className}
					isR18={true}
					ncode={rankingItem.ncode}
					item={undefined}
					rankingItem={rankingItem}
					isPending={false}
					isError={true}
				/>
			)}
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
		</CatchBoundary>
	);
};

export default RankingItem;
