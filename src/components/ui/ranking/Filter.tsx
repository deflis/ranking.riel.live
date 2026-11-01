import { Disclosure, Transition } from "@headlessui/react";
import { useAtom, useAtomValue } from "jotai";
import { GenreNotation } from "narou";
import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";

import {
	type FilterConfig,
	filterConfigAtom,
	isUseFilterAtom,
} from "@/modules/atoms/filter";
import { allGenres } from "@/modules/enum/Genre";
import { readFilterFormData } from "@/modules/utils/readFilterFormData";
import { nowInTokyo } from "@/modules/utils/temporal";

import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { SelectBox } from "../atoms/SelectBox";
import { TextField } from "../atoms/TextField";

import styles from "./Filter.module.css";

const InnerFilterComponent: React.FC<{ onClose: () => void }> = ({
	onClose,
}) => {
	const [savedConfig, setFilterConfig] = useAtom(filterConfigAtom);
	const [config, setConfig] = useState(savedConfig);

	const selectAll = () => {
		setConfig((current) => ({
			...current,
			genres: Object.fromEntries(
				allGenres.map((id) => [`g${id}`, true]),
			) as FilterConfig["genres"],
		}));
	};
	const unselectAll = () => {
		setConfig((current) => ({
			...current,
			genres: Object.fromEntries(
				allGenres.map((id) => [`g${id}`, false]),
			) as FilterConfig["genres"],
		}));
	};

	const clear = () => {
		setConfig((current) => ({
			...current,
			genres: Object.fromEntries(
				allGenres.map((id) => [`g${id}`, true]),
			) as FilterConfig["genres"],
			firstUpdate: { ...current.firstUpdate, term: "none" },
			story: {
				min: { ...current.story.min, enable: false },
				max: { ...current.story.max, enable: false },
			},
			length: {
				min: { ...current.length.min, enable: false },
				max: { ...current.length.max, enable: false },
			},
			status: { kanketsu: true, rensai: true, tanpen: true },
		}));
	};

	const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFilterConfig(
			readFilterFormData(new FormData(event.currentTarget), config),
		);
		onClose();
	};

	return (
		<form noValidate autoComplete="off" onSubmit={onSubmit}>
			<div className={styles.container}>
				<fieldset>
					<legend className={styles.label}>ジャンル</legend>
					{allGenres.map((id) => (
						<React.Fragment key={id}>
							<label>
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
						</React.Fragment>
					))}
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
							defaultValue={config.story.min.value}
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
							defaultValue={config.story.max.value}
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
							defaultValue={config.length.min.value}
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
							defaultValue={config.length.max.value}
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
							{ value: "2days", label: "2日より新しい" },
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
						defaultValue={config.firstUpdate.begin}
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
				<fieldset className="space-x-4">
					<Button type="submit" color="primary" className="font-bold">
						<FaSearch className="w-5 h-5 pr-2 inline" />
						適用
					</Button>
					<Button onClick={clear} className="font-bold">
						<FaTimes className="w-5 h-5 pr-2 inline" />
						クリア
					</Button>
				</fieldset>
			</div>
		</form>
	);
};

export const FilterComponent: React.FC = () => {
	const enable = useAtomValue(isUseFilterAtom);
	return (
		<Disclosure as="div" className={styles.filter}>
			{({ open, close }) => (
				<>
					<Disclosure.Button className={styles.button}>
						<span className={styles.label}>
							フィルター : {enable ? "有効" : "無効"}
						</span>
						<HiChevronDown
							className={[styles.icon, open && styles.open]
								.filter(Boolean)
								.join(" ")}
						/>
					</Disclosure.Button>
					<Transition
						as="div"
						className={styles.filter_transition}
						enter={styles.enter}
						enterFrom={styles.enter_from}
						enterTo={styles.enter_to}
						leave={styles.leave}
						leaveFrom={styles.leave_from}
						leaveTo={styles.leave_to}
					>
						<Disclosure.Panel className={styles.panel}>
							<InnerFilterComponent onClose={close} />
						</Disclosure.Panel>
					</Transition>
				</>
			)}
		</Disclosure>
	);
};
