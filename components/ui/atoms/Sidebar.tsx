import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  Fragment,
  PropsWithChildren,
  PropsWithRef,
  ReactElement,
} from "react";

type SidebarItemProps<T extends ElementType> = {
  as?: T;
  hover?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

function SidebarItemBase<T extends ElementType = "span">(
  { className, as, hover, ...props }: SidebarItemProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "span";
  return (
    <li className="relative">
      <Component
        ref={ref as any}
        className={clsx(
          "flex items-center text-md py-4 px-2 h-12 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap rounded transition duration-300 ease-in-out",
          hover && "hover:text-gray-900 hover:bg-gray-100",
          className
        )}
        {...props}
      />
    </li>
  );
}

interface SidebarItem {
  <T extends ElementType = "span">(
    x: PropsWithRef<SidebarItemProps<T>>
  ): ReactElement | null;
}

export const SidebarItem: SidebarItem = forwardRef(SidebarItemBase) as any;

export const Divider = () => <hr className="my-2" />;

export const Sidebar: React.FC<
  PropsWithChildren<{
    open: boolean;
    onClose: (value: boolean) => void;
  }>
> = ({ open, onClose, children }) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      </Transition.Child>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-x-0 origin-left"
        enterTo="opacity-100 scale-100 origin-left"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100 origin-left"
        leaveTo="opacity-0 scale-x-0 origin-left"
      >
        <Dialog.Panel className="w-120 h-full shadow-md bg-white px-1 absolute top-0 overflow-y-auto">
          <ul className="relative">{children}</ul>
        </Dialog.Panel>
      </Transition.Child>
    </Dialog>
  </Transition>
);
