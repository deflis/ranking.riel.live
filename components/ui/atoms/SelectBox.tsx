import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi";

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
  <div className={clsx("relative inline-block text-left", className)}>
    <Listbox value={selectedValue} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Button
            className={clsx(
              "inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500",
              "dark:bg-zinc-900 dark:border-zinc-700 focus:ring-offset-gray-500 focus:ring-indigo-800 dark:text-white dark:disabled:bg-zinc-700",
              buttonClassName
            )}
          >
            {options.find(({ value }) => value === selectedValue)?.label}
            <div className="flex-grow"></div>
            <HiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </Listbox.Button>
          <Transition
            show={open}
            className={clsx(
              "origin-top-left absolute left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none",
              "dark:bg-zinc-900 dark-text-white"
            )}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="py-1">
              {options.map(({ value, label }) => (
                <Listbox.Option
                  key={`${value}`}
                  value={value}
                  className={clsx(
                    value === selectedValue
                      ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-white"
                      : "text-gray-700 focus:bg-gray-50 dark:text-zinc-100 dark:focus:bg-zinc-800",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  {label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  </div>
);
