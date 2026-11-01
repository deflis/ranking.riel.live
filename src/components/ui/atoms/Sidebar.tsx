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
		<li className="relative">
			<Component
				ref={ref}
				className={[
					"link-reset flex items-center text-md py-4 px-2 h-12 overflow-hidden text-gray-700 dark:text-gray-300 text-ellipsis whitespace-nowrap rounded transition duration-300 ease-in-out",
					hover &&
						"hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			/>
		</li>
	);
}

export const Divider = () => (
	<hr className="my-2 border-stone-200 dark:border-stone-700" />
);

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
				enter="transition-opacity ease-out duration-300 motion-reduce:duration-0"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity ease-in duration-200 motion-reduce:duration-0"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			</TransitionChild>
			<TransitionChild
				as={Fragment}
				enter="transition-transform ease-out duration-300 motion-reduce:duration-0"
				enterFrom="-translate-x-full"
				enterTo="translate-x-0"
				leave="transition-transform ease-in duration-200 motion-reduce:duration-0"
				leaveFrom="translate-x-0"
				leaveTo="-translate-x-full"
			>
				<DialogPanel className="w-120 max-w-[calc(100%-2rem)] h-full shadow-md bg-white dark:bg-neutral-900 px-1 fixed inset-y-0 left-0 overflow-y-auto">
					<div className="flex items-center justify-between px-2 py-1">
						<DialogTitle className="font-semibold">メニュー</DialogTitle>
						<button
							type="button"
							aria-label="メニューを閉じる"
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
							onClick={() => onClose(false)}
						>
							<HiX className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
					<ul className="relative">{children}</ul>
				</DialogPanel>
			</TransitionChild>
		</Dialog>
	</Transition>
);
