import { Disclosure, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { GenreNotation } from "narou";
import React, { useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FaSearch, FaTimes } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";

import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { SelectBox } from "../atoms/SelectBox";
import { TextField } from "../atoms/TextField";

import {
	type FilterConfig,
	filterConfigAtom,
	isUseFilterAtom,
} from "@/modules/atoms/filter";
import { allGenres } from "@/modules/enum/Genre";
import styles from "./Filter.module.css";

const InnerFilterComponent: React.FC<{ onClose: () => void }> = ({
	onClose,
}) => {
	const [filterCondig, setFilterConfig] = useAtom(filterConfigAtom);
	const { handleSubmit, register, control, setValue } = useForm({
		defaultValues: filterCondig,
	});

	const selectAll = useCallback(
		() => {
			for (const id of allGenres) {
				setValue(`genres.g${id}`, true);
			}
		},
		[setValue],
	);
	const unselectAll = useCallback(
		() => {
			for (const id of allGenres) {
				setValue(`genres.g${id}`, false);
			}
		},
		[setValue],
	);

	const clear = useCallback(() => {
		for (const id of allGenres) {
			setValue(`genres.g${id}`, true);
		}
		setValue("firstUpdate.term", "none");
		setValue("story.min.enable", false);
		setValue("story.max.enable", false);
		setValue("status.kanketsu", true);
		setValue("status.rensai", true);
		setValue("status.tanpen", true);
	}, [setValue]);

	const onSubmit = useCallback(
		(config: FilterConfig) => {
			setFilterConfig(config);
			onClose();
		},
		[onClose, setFilterConfig],
	);

	return (
		<form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
			<div className={styles.container}>
				<fieldset>
					<legend className={styles.label}>ジャンル</legend>
					{allGenres.map((id) => (
						<React.Fragment key={id}>
							<label>
								<Checkbox {...register(`genres.g${id}`)} />
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
						<Checkbox {...register("story.min.enable")} />
						最小
						<TextField
							type="number"
							min="1"
							{...register("story.min.value", { valueAsNumber: true })}
							disabled={!useWatch({ control, name: "story.min.enable" })}
						/>
					</label>
					～
					<label>
						<Checkbox {...register("story.max.enable")} />
						最大
						<TextField
							type="number"
							min="1"
							{...register("story.max.value", { valueAsNumber: true })}
							disabled={!useWatch({ control, name: "story.max.enable" })}
						/>
					</label>
				</fieldset>
				<fieldset>
					<legend className={styles.label}>更新開始日</legend>
					<Controller
						name="firstUpdate.term"
						control={control}
						render={({ field: { onChange, value } }) => (
							<SelectBox
								value={value}
								onChange={onChange}
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
						)}
					/>
					<TextField
						type="date"
						{...register("firstUpdate.begin")}
						min={
							DateTime.fromObject({
								year: 2013,
								month: 5,
								day: 1,
							}).toISODate() ?? ""
						}
						max={DateTime.now().toISODate() ?? ""}
						disabled={
							useWatch({ control, name: "firstUpdate.term" }) !== "custom"
						}
					/>
				</fieldset>
				<fieldset>
					<legend className={styles.label}>更新状態</legend>
					<label>
						<Checkbox {...register("status.rensai")} />
						連載中
					</label>
					<label>
						<Checkbox {...register("status.kanketsu")} />
						完結
					</label>
					<label>
						<Checkbox {...register("status.tanpen")} />
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
						<HiChevronDown className={clsx(styles.icon, open && styles.open)} />
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
