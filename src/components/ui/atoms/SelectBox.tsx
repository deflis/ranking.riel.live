import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Transition,
} from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";

import styles from "./form.module.css";
import inputStyles from "./Input.module.css";

export type ListBoxOption<T> = {
	value: T;
	label: React.ReactNode;
	disabled?: boolean;
};

export type ListBoxProps<T> = {
	value: T;
	options: ListBoxOption<T>[];
	onChange(value: T): void;
	className?: string;
	buttonClassName?: string;
};

export const SelectBox = <T,>({
	value: selectedValue,
	options,
	onChange,
	className,
	buttonClassName,
}: ListBoxProps<T>) => (
	<div className={[styles.select_box, className].filter(Boolean).join(" ")}>
		<Listbox value={selectedValue} onChange={onChange}>
			{({ open }) => (
				<div className="relative w-full">
					<ListboxButton
						className={[inputStyles.input, buttonClassName]
							.filter(Boolean)
							.join(" ")}
					>
						{options.find(({ value }) => value === selectedValue)?.label}
						<div className="grow" />
						<HiChevronDown
							className={inputStyles.append_icon}
							aria-hidden="true"
						/>
					</ListboxButton>
					<Transition
						as="div"
						show={open}
						className={styles.select_box_transition}
						enter={styles.enter}
						enterFrom={styles.enter_from}
						enterTo={styles.enter_to}
						leave={styles.leave}
						leaveFrom={styles.leave_from}
						leaveTo={styles.leave_to}
					>
						<ListboxOptions className={styles.select_box_options}>
							{options.map(({ value, label }) => (
								<ListboxOption
									key={`${value}`}
									value={value}
									className={[
										styles.option,
										value === selectedValue && styles.selected,
									]
										.filter(Boolean)
										.join(" ")}
								>
									{label}
								</ListboxOption>
							))}
						</ListboxOptions>
					</Transition>
				</div>
			)}
		</Listbox>
	</div>
);
