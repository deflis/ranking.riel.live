import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import {
	type ComponentProps,
	type ElementType,
	Fragment,
	type PropsWithChildren,
} from "react";
import { HiX } from "react-icons/hi";

import styles from "./Sidebar.module.css";

export type SidebarItemProps<T extends ElementType = "span"> = {
	as?: T;
	hover?: boolean;
} & ComponentProps<T>;

export function SidebarItem<T extends ElementType = "span">({
	className,
	as,
	hover,
	ref,
	...props
}: SidebarItemProps<T>) {
	const Component = as ?? "span";
	return (
		<li className={styles.relative}>
			<Component
				ref={ref}
				className={[
					"link-reset",
					styles.item,
					hover && styles.hoverable,
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			/>
		</li>
	);
}

export const Divider = () => <hr className={styles.divider} />;

type SidebarProps = PropsWithChildren<{
	open: boolean;
	onClose: (value: boolean) => void;
}>;

export const Sidebar: React.FC<SidebarProps> = ({
	open,
	onClose,
	children,
}: SidebarProps) => (
	<Transition appear show={open} as={Fragment}>
		<Dialog onClose={onClose}>
			<TransitionChild
				as={Fragment}
				enter={styles.backdropEnter}
				enterFrom={styles.transparent}
				enterTo={styles.opaque}
				leave={styles.backdropLeave}
				leaveFrom={styles.opaque}
				leaveTo={styles.transparent}
			>
				<div className={styles.backdrop} aria-hidden="true" />
			</TransitionChild>
			<TransitionChild
				as={Fragment}
				enter={styles.panelEnter}
				enterFrom={styles.offscreen}
				enterTo={styles.onscreen}
				leave={styles.panelLeave}
				leaveFrom={styles.onscreen}
				leaveTo={styles.offscreen}
			>
				<DialogPanel className={styles.panel}>
					<div className={styles.header}>
						<DialogTitle className={styles.title}>メニュー</DialogTitle>
						<button
							type="button"
							aria-label="メニューを閉じる"
							className={styles.closeButton}
							onClick={() => onClose(false)}
						>
							<HiX className={styles.closeIcon} aria-hidden="true" />
						</button>
					</div>
					<ul className={styles.relative}>{children}</ul>
				</DialogPanel>
			</TransitionChild>
		</Dialog>
	</Transition>
);
