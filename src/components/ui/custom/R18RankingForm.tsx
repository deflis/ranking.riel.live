import { R18Site, R18SiteNotation } from "narou";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";

import { useToggle } from "@/hooks/useToggle";
import { readFilterFormData } from "@/modules/utils/readFilterFormData";
import { nowInTokyo } from "@/modules/utils/temporal";

import {
	type FilterConfig,
	getTermFromRaw,
	parseDateRange,
} from "../../../modules/atoms/filter";
import type { R18RankingParams } from "../../../modules/interfaces/CustomRankingParams";
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

import styles from "./SearchForm.module.css";

export interface R18RankingFormParams {
	params: R18RankingParams;
	onSearch: (e: R18RankingParams) => void;
}

interface InnerParams {
	onClose: () => void;
}

export const R18RankingForm: React.FC<R18RankingFormParams> = ({
	params,
	onSearch,
}) => {
	const [show, toggleShow] = useToggle(false);
	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<div className={styles.spacer} />
				<Button onClick={toggleShow}>
					<FaCog className={styles.icon} />
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

const DisableCustomRankingForm: React.FC<{
	params: R18RankingParams;
}> = ({
	params: { keyword, rankingType, sites, min, max, minLength, maxLength },
}: {
	params: R18RankingParams;
}) => {
	const genre =
		sites.length > 0 ? (
			<>
				サイト:
				{sites.map((site) => (
					<Fragment key={site}>
						{" "}
						<Tag>{R18SiteNotation[site]}</Tag>
					</Fragment>
				))}
			</>
		) : (
			"サイト設定なし"
		);
	return (
		<>
			<h1 className={styles.title}>
				{keyword ? `${keyword}の` : "カスタム"}
				{RankingTypeName[rankingType]}ランキング
			</h1>
			<h2>{genre}</h2>
			<div className={styles.summary}>
				{(min || max) && (
					<Tag className={styles.tag}>
						話数: {min ? `最小${min}` : ""}
						{max ? `最大${max}` : ""}
					</Tag>
				)}
				{(minLength || maxLength) && (
					<Tag className={styles.tag}>
						文字数: {minLength ? `最小${minLength}` : ""}
						{maxLength ? `最大${maxLength}` : ""}
					</Tag>
				)}
			</div>
		</>
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
	sites: {
		nocturne: boolean;
		moonLight: boolean;
		moonLightBL: boolean;
		midnight: boolean;
	};
} & Omit<FilterConfig, "genres">;

function getDefaultValues({
	rankingType,
	keyword,
	notKeyword,
	byTitle,
	byStory,
	sites,
	min,
	max,
	minLength,
	maxLength,
	firstUpdate: firstUpdateRaw,
	kanketsu,
	rensai,
	tanpen,
}: R18RankingParams): CustomRankingConfig {
	const firstUpdate = parseDateRange(firstUpdateRaw);
	return {
		rankingType,
		keyword: keyword ?? "",
		notKeyword: notKeyword ?? "",
		byTitle,
		byStory,
		sites: {
			nocturne: sites.includes(R18Site.Nocturne),
			moonLight: sites.includes(R18Site.MoonLight),
			moonLightBL: sites.includes(R18Site.MoonLightBL),
			midnight: sites.includes(R18Site.Midnight),
		},
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
	sites: { nocturne, moonLight, moonLightBL, midnight },
	story,
	length,
	firstUpdate,
	status,
}: CustomRankingConfig): R18RankingParams {
	return {
		rankingType,
		keyword,
		notKeyword,
		byTitle,
		byStory,
		sites: [
			...(nocturne ? [R18Site.Nocturne] : []),
			...(moonLight ? [R18Site.MoonLight] : []),
			...(moonLightBL ? [R18Site.MoonLightBL] : []),
			...(midnight ? [R18Site.Midnight] : []),
		],
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

const EnableCustomRankingForm: React.FC<R18RankingFormParams & InnerParams> = ({
	params,
	onSearch,
	onClose,
}) => {
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

	const selectAll = () => {
		setConfig((current) => ({
			...current,
			sites: {
				nocturne: true,
				moonLight: true,
				moonLightBL: true,
				midnight: true,
			},
		}));
	};

	const unselectAll = () => {
		setConfig((current) => ({
			...current,
			sites: {
				nocturne: false,
				moonLight: false,
				moonLightBL: false,
				midnight: false,
			},
		}));
	};

	return (
		<form ref={formRef} onSubmit={handleSearch}>
			<Paper className={styles.panel}>
				<fieldset>
					<label className={styles.field}>
						<span className={styles.label}>種類</span>
						<SelectBox
							value={config.rankingType}
							onChange={(value) =>
								setConfig((current) => ({ ...current, rankingType: value }))
							}
							options={rankingTypeList.map((value) => ({
								value,
								label: RankingTypeName[value],
							}))}
							buttonClassName={styles.selectButton}
						/>
					</label>
				</fieldset>
				<fieldset className={styles.keywordFields}>
					<label className={styles.field}>
						<span className={styles.label}>キーワード</span>
						<TextField
							name="keyword"
							defaultValue={defaultValues.keyword}
							className={styles.aligned}
						/>
					</label>
					<label className={styles.field}>
						<span className={styles.label}>除外キーワード</span>
						<TextField
							name="notKeyword"
							defaultValue={defaultValues.notKeyword}
							className={styles.aligned}
						/>
					</label>

					<label>
						<Checkbox
							checked={config.byTitle}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({ ...current, byTitle: value }));
							}}
							className={styles.aligned}
						/>
						<span className={styles.aligned}>タイトルを含める</span>
					</label>
					<label>
						<Checkbox
							checked={config.byStory}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({ ...current, byStory: value }));
							}}
							className={styles.aligned}
						/>
						<span className={styles.aligned}>あらすじを含める</span>
					</label>
				</fieldset>
				<fieldset>
					<legend className={styles.label}>サイト</legend>
					<label>
						<Checkbox
							checked={config.sites.nocturne}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									sites: { ...current.sites, nocturne: value },
								}));
							}}
						/>
						{R18SiteNotation[R18Site.Nocturne]}
					</label>
					<label>
						<Checkbox
							checked={config.sites.moonLight}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									sites: { ...current.sites, moonLight: value },
								}));
							}}
						/>
						{R18SiteNotation[R18Site.MoonLight]}
					</label>
					<label>
						<Checkbox
							checked={config.sites.moonLightBL}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									sites: { ...current.sites, moonLightBL: value },
								}));
							}}
						/>
						{R18SiteNotation[R18Site.MoonLightBL]}
					</label>
					<label>
						<Checkbox
							checked={config.sites.midnight}
							onChange={(event) => {
								const value = event.currentTarget.checked;
								setConfig((current) => ({
									...current,
									sites: { ...current.sites, midnight: value },
								}));
							}}
						/>
						{R18SiteNotation[R18Site.Midnight]}
					</label>
					<Button onClick={selectAll}>全選択</Button>
					<Button onClick={unselectAll}>全解除</Button>
				</fieldset>
				<fieldset>
					<legend className={styles.label}>話数</legend>
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
					<legend className={styles.label}>文字数</legend>
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
					<legend className={styles.label}>更新開始日</legend>
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
						buttonClassName={styles.selectButton}
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
					<legend className={styles.label}>更新状態</legend>
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
				<fieldset className={styles.actions}>
					<Button type="submit" color="primary">
						<FaSearch className={styles.icon} />
						検索
					</Button>
					<Button onClick={onClose}>
						<FaTimes className={styles.icon} />
						閉じる
					</Button>
				</fieldset>
			</Paper>
		</form>
	);
};
