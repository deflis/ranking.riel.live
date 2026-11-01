import { GenreNotation } from "narou";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";

import { useToggle } from "@/hooks/useToggle";
import { readFilterFormData } from "@/modules/utils/readFilterFormData";
import {
	nowInTokyo,
	parseDateTime,
	formatJapaneseDate,
} from "@/modules/utils/temporal";

import {
	type FilterConfig,
	type TermStrings,
	getTermFromRaw,
	parseDateRange,
} from "../../../modules/atoms/filter";
import { allGenres } from "../../../modules/enum/Genre";
import type { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import {
	RankingType,
	RankingTypeName,
} from "../../../modules/interfaces/RankingType";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Paper } from "../atoms/Paper";
import { SelectBox } from "../atoms/SelectBox";
import { TextField } from "../atoms/TextField";
import { Tag } from "../common/bulma/Tag";

export interface CustomRankingFormParams {
	params: CustomRankingParams;
	onSearch: (e: CustomRankingParams) => void;
}

interface InnerParams {
	onClose: () => void;
}

export const CustomRankingForm: React.FC<CustomRankingFormParams> = ({
	params,
	onSearch,
}) => {
	const [show, toggleShow] = useToggle(false);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-row space-y-4">
				<div className="grow" />
				<Button onClick={toggleShow}>
					<FaCog className="w-5 h-5 pr-2 inline" />
					編集
				</Button>
			</div>
			{show ? (
				<EnableCustomRankingForm
					params={params}
					onSearch={onSearch}
					onClose={toggleShow}
				/>
			) : (
				<DisableCustomRankingForm params={params} />
			)}
		</div>
	);
};

const rankingTypeList = [
	RankingType.Daily,
	RankingType.Weekly,
	RankingType.Monthly,
	RankingType.Quarter,
	RankingType.Yearly,
	RankingType.All,
	RankingType.UniqueUser,
] as const;

type CustomRankingConfig = {
	rankingType: RankingType;
	keyword: string;
	notKeyword: string;
	byTitle: boolean;
	byStory: boolean;
} & FilterConfig;

function getDefaultValues({
	rankingType,
	keyword,
	notKeyword,
	byTitle,
	byStory,
	genres,
	min,
	max,
	minLength,
	maxLength,
	firstUpdate: firstUpdateRaw,
	kanketsu,
	rensai,
	tanpen,
}: CustomRankingParams): CustomRankingConfig {
	const firstUpdate = parseDateRange(firstUpdateRaw);
	return {
		rankingType,
		keyword: keyword ?? "",
		notKeyword: notKeyword ?? "",
		byTitle,
		byStory,
		genres: allGenres.reduce(
			(accumulator, id) => {
				accumulator[`g${id}`] = genres.includes(id);
				return accumulator;
			},
			{} as Record<`g${(typeof allGenres)[number]}`, boolean>,
		),
		story: {
			min: {
				enable: !!min,
				value: min ?? 1,
			},
			max: {
				enable: !!max,
				value: max ?? 1000,
			},
		},
		length: {
			min: {
				enable: !!minLength,
				value: minLength ?? 1,
			},
			max: {
				enable: !!maxLength,
				value: maxLength ?? 1000000,
			},
		},
		firstUpdate: {
			term: getTermFromRaw(firstUpdateRaw),
			begin:
				firstUpdate?.toPlainDate().toString() ??
				nowInTokyo().toPlainDate().toString(),
			end: "",
		},
		status: {
			kanketsu,
			rensai,
			tanpen,
		},
	};
}

function convertToParams({
	rankingType,
	keyword,
	notKeyword,
	byTitle,
	byStory,
	genres,
	story,
	length,
	firstUpdate,
	status,
}: CustomRankingConfig): CustomRankingParams {
	return {
		rankingType,
		keyword,
		notKeyword,
		byTitle,
		byStory,
		genres: allGenres.filter((id) => genres[`g${id}`]),
		min: story.min.enable ? story.min.value : undefined,
		max: story.max.enable ? story.max.value : undefined,
		minLength: length.min.enable ? length.min.value : undefined,
		maxLength: length.max.enable ? length.max.value : undefined,
		firstUpdate:
			firstUpdate.term === "custom"
				? firstUpdate.begin
				: firstUpdate.term !== "none"
					? firstUpdate.term
					: undefined,
		...status,
	};
}

/**
 * TermStringsまたはISO日付文字列から、人間が読みやすい形式に変換する
 */
function formatDateRange(raw: string | TermStrings | undefined): string {
	if (!raw) {
		return "";
	}

	// 相対時間形式の処理
	if (raw === "1days") {
		return "1日";
	}
	if (raw === "7days") {
		return "1週間";
	}
	if (raw === "1months") {
		return "1ヶ月";
	}
	if (raw === "6months") {
		return "半年";
	}
	if (raw === "1years") {
		return "1年";
	}

	// ISO日付形式の処理
	try {
		const date = parseDateTime(raw);
		return formatJapaneseDate(date.toPlainDate());
	} catch {
		return "";
	}
}

const DisableCustomRankingForm: React.FC<{
	params: CustomRankingParams;
}> = React.memo(function DisableCustomRankingFormBase({
	params: {
		keyword,
		rankingType,
		genres,
		notKeyword,
		byTitle,
		byStory,
		min,
		max,
		minLength,
		maxLength,
		firstUpdate,
		rensai,
		kanketsu,
		tanpen,
	},
}: {
	params: CustomRankingParams;
}) {
	return (
		<>
			<h1 className="text-4xl md:text-6xl my-8">
				{keyword ? `${keyword}の` : "カスタム"}
				{RankingTypeName[rankingType]}ランキング
			</h1>
			<div className="flex flex-wrap gap-1">
				{keyword && <Tag className="px-2 py-1">キーワード: {keyword}</Tag>}
				{notKeyword && <Tag className="px-2 py-1">除外: {notKeyword}</Tag>}
				{genres.length > 0 &&
					genres.map((id) => (
						<Tag key={id} className="px-2 py-1">
							ジャンル: {GenreNotation[id]}
						</Tag>
					))}
				{byTitle && <Tag className="px-2 py-1">タイトルを含める</Tag>}
				{byStory && <Tag className="px-2 py-1">あらすじを含める</Tag>}
				{(min || max) && (
					<Tag className="px-2 py-1">
						話数: {min ? `最小${min}` : ""}
						{max ? `最大${max}` : ""}
					</Tag>
				)}
				{(minLength || maxLength) && (
					<Tag className="px-2 py-1">
						文字数: {minLength ? `最小${minLength}` : ""}
						{maxLength ? `最大${maxLength}` : ""}
					</Tag>
				)}
				{firstUpdate && (
					<Tag className="px-2 py-1">
						更新開始日: {formatDateRange(firstUpdate)}
					</Tag>
				)}
				{(rensai || kanketsu || tanpen) && (
					<Tag className="px-2 py-1 space-x-1">
						{rensai && <span>連載中</span>}
						{kanketsu && <span>完結</span>}
						{tanpen && <span>短編</span>}
					</Tag>
				)}
			</div>
		</>
	);
});

const EnableCustomRankingForm: React.FC<
	CustomRankingFormParams & InnerParams
> = ({ params, onSearch, onClose }) => {
	const defaultValues = useMemo(() => getDefaultValues(params), [params]);
	const [config, setConfig] = useState(defaultValues);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		setConfig(defaultValues);
		formRef.current?.reset();
	}, [defaultValues]);

	const handleSearch = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		onSearch(
			convertToParams({
				...readFilterFormData(data, config),
				keyword: String(data.get("keyword") ?? ""),
				notKeyword: String(data.get("notKeyword") ?? ""),
			}),
		);
	};

	const selectAll = useCallback(() => {
		setConfig((current) => ({
			...current,
			genres: Object.fromEntries(
				allGenres.map((id) => [`g${id}`, true]),
			) as FilterConfig["genres"],
		}));
	}, []);

	const unselectAll = useCallback(() => {
		setConfig((current) => ({
			...current,
			genres: Object.fromEntries(
				allGenres.map((id) => [`g${id}`, false]),
			) as FilterConfig["genres"],
		}));
	}, []);

	return (
		<form ref={formRef} onSubmit={handleSearch}>
			<Paper className="bg-white p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
				<fieldset>
					<label className="inline-flex flex-col">
						<span className="font-bold text-sm text-slate-500">種類</span>
						<SelectBox
							value={config.rankingType}
							onChange={(value) =>
								setConfig((current) => ({ ...current, rankingType: value }))
							}
							options={rankingTypeList.map((value) => ({
								value,
								label: RankingTypeName[value],
							}))}
							buttonClassName="w-52"
						/>
					</label>
				</fieldset>
				<fieldset className="space-x-2 flex items-end">
					<label className="inline-flex flex-col">
						<span className="font-bold text-sm text-slate-500">キーワード</span>
						<TextField
							name="keyword"
							defaultValue={defaultValues.keyword}
							className="align-middle"
						/>
					</label>
					<label className="inline-flex flex-col">
						<span className="font-bold text-sm  text-slate-500">
							除外キーワード
						</span>
						<TextField
							name="notKeyword"
							defaultValue={defaultValues.notKeyword}
							className="align-middle"
						/>
					</label>

					<label>
						<Checkbox
							checked={config.byTitle}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({ ...current, byTitle: value }));
							}}
							className="align-middle"
						/>
						<span className="align-middle">タイトルを含める</span>
					</label>
					<label>
						<Checkbox
							checked={config.byStory}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({ ...current, byStory: value }));
							}}
							className="align-middle"
						/>
						<span className="align-middle">あらすじを含める</span>
					</label>
				</fieldset>
				<fieldset>
					<legend className="font-bold text-sm text-slate-500">ジャンル</legend>
					{allGenres.map((id) => (
						<label key={id}>
							<Checkbox
								checked={config.genres[`g${id}`]}
								onChange={(event) => {
									const value = event.currentTarget.checked;
									setConfig((current) => ({
										...current,
										genres: { ...current.genres, [`g${id}`]: value },
									}));
								}}
							/>
							{GenreNotation[id]}
						</label>
					))}
					<Button onClick={selectAll}>全選択</Button>
					<Button onClick={unselectAll}>全解除</Button>
				</fieldset>
				<fieldset>
					<legend className="font-bold text-sm text-slate-500">話数</legend>
					<label>
						<Checkbox
							checked={config.story.min.enable}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									story: {
										...current.story,
										min: { ...current.story.min, enable: value },
									},
								}));
							}}
						/>
						最小
						<TextField
							type="number"
							min="1"
							name="story.min.value"
							defaultValue={defaultValues.story.min.value}
							disabled={!config.story.min.enable}
						/>
					</label>
					～
					<label>
						<Checkbox
							checked={config.story.max.enable}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									story: {
										...current.story,
										max: { ...current.story.max, enable: value },
									},
								}));
							}}
						/>
						最大
						<TextField
							type="number"
							min="1"
							name="story.max.value"
							defaultValue={defaultValues.story.max.value}
							disabled={!config.story.max.enable}
						/>
					</label>
				</fieldset>
				<fieldset>
					<legend className="font-bold text-sm text-slate-500">文字数</legend>
					<label>
						<Checkbox
							checked={config.length.min.enable}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									length: {
										...current.length,
										min: { ...current.length.min, enable: value },
									},
								}));
							}}
						/>
						最小
						<TextField
							type="number"
							min="1"
							name="length.min.value"
							defaultValue={defaultValues.length.min.value}
							disabled={!config.length.min.enable}
						/>
					</label>
					～
					<label>
						<Checkbox
							checked={config.length.max.enable}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									length: {
										...current.length,
										max: { ...current.length.max, enable: value },
									},
								}));
							}}
						/>
						最大
						<TextField
							type="number"
							min="1"
							name="length.max.value"
							defaultValue={defaultValues.length.max.value}
							disabled={!config.length.max.enable}
						/>
					</label>
				</fieldset>
				<fieldset>
					<legend className="font-bold text-sm text-slate-500">
						更新開始日
					</legend>
					<SelectBox<FilterConfig["firstUpdate"]["term"]>
						value={config.firstUpdate.term}
						onChange={(value) =>
							setConfig((current) => ({
								...current,
								firstUpdate: { ...current.firstUpdate, term: value },
							}))
						}
						options={[
							{ value: "none", label: "指定しない" },
							{ value: "1days", label: "1日より新しい" },
							{ value: "7days", label: "1週間より新しい" },
							{ value: "1months", label: "1ヶ月より新しい" },
							{ value: "6months", label: "半年より新しい" },
							{ value: "1years", label: "1年より新しい" },
							{ value: "custom", label: "選択する" },
						]}
						buttonClassName="w-52"
					/>
					<TextField
						type="date"
						name="firstUpdate.begin"
						defaultValue={defaultValues.firstUpdate.begin}
						min={"2013-05-01"}
						max={nowInTokyo().toPlainDate().toString()}
						disabled={config.firstUpdate.term !== "custom"}
					/>
				</fieldset>
				<fieldset>
					<legend className="font-bold text-sm text-slate-500">更新状態</legend>
					<label>
						<Checkbox
							checked={config.status.rensai}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									status: { ...current.status, rensai: value },
								}));
							}}
						/>
						連載中
					</label>
					<label>
						<Checkbox
							checked={config.status.kanketsu}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									status: { ...current.status, kanketsu: value },
								}));
							}}
						/>
						完結
					</label>
					<label>
						<Checkbox
							checked={config.status.tanpen}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									status: { ...current.status, tanpen: value },
								}));
							}}
						/>
						短編
					</label>
				</fieldset>
				<fieldset className="space-x-4">
					<Button type="submit" color="primary" className="font-bold">
						<FaSearch className="w-5 h-5 pr-2 inline" />
						検索
					</Button>
					<Button onClick={onClose} className="font-bold">
						<FaTimes className="w-5 h-5 pr-2 inline" />
						閉じる
					</Button>
				</fieldset>
			</Paper>
		</form>
	);
};
