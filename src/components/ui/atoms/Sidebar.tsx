import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import {
	type ComponentPropsWithoutRef,
	type ElementType,
	type ForwardedRef,
	Fragment,
	type PropsWithChildren,
	type PropsWithRef,
	type ReactElement,
	forwardRef,
} from "react";

type SidebarItemProps<T extends ElementType> = {
	as?: T;
	hover?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

function SidebarItemBase<T extends ElementType = "span">(
	{ className, as, hover, ...props }: SidebarItemProps<T>,
	ref: ForwardedRef<T>,
) {
	const Component = as ?? "span";
	return (
		<li className="relative">
			<Component
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				ref={ref as any}
				className={clsx(
					"link-reset flex items-center text-md py-4 px-2 h-12 overflow-hidden text-gray-700 dark:text-gray-300 text-ellipsis whitespace-nowrap rounded transition duration-300 ease-in-out",
					hover &&
						"hover:text-gray-900 hover:bg-gray-100 darl:hover:text-gray-100 dark:hover:bg-gray-700",
					className,
				)}
				{...props}
			/>
		</li>
	);
}

type SidebarItem = <T extends ElementType = "span">(
	x: PropsWithRef<SidebarItemProps<T>>,
) => ReactElement | null;

export const SidebarItem = forwardRef(SidebarItemBase) as SidebarItem;

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
				enter="ease-out duration-300"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="ease-in duration-200"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			</TransitionChild>
			<TransitionChild
				as={Fragment}
				enter="ease-out duration-300"
				enterFrom="opacity-0 scale-x-0 origin-left"
				enterTo="opacity-100 scale-100 origin-left"
				leave="ease-in duration-200"
				leaveFrom="opacity-100 scale-100 origin-left"
				leaveTo="opacity-0 scale-x-0 origin-left"
			>
				<DialogPanel className="w-120 h-full shadow-md bg-white dark:bg-neutral-900 px-1 absolute top-0 overflow-y-auto">
					<ul className="relative">{children}</ul>
				</DialogPanel>
			</TransitionChild>
		</Dialog>
	</Transition>
);
