import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Transition,
} from "@headlessui/react";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi";

import styles from "./form.module.css";

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
	<div className={clsx(styles.select_box, className)}>
		<Listbox value={selectedValue} onChange={onChange}>
			{({ open }) => (
				<div className="relative w-full">
					<ListboxButton className={clsx(styles.input, buttonClassName)}>
						{options.find(({ value }) => value === selectedValue)?.label}
						<div className="flex-grow" />
						<HiChevronDown className={styles.append_icon} aria-hidden="true" />
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
									className={clsx(
										styles.option,
										value === selectedValue && styles.selected,
									)}
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
