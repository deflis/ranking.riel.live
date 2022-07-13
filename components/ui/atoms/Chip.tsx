import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
} from "react";

type ButtonProps<T extends ElementType = "a"> = {
  as?: T;
  color?: "primary";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "color">;

function ChipBase<T extends ElementType = "a">(
  { className, as, color, ...props }: ButtonProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "a";
  return (
    <Component
      ref={ref as any}
      className={clsx(
        "text-black border-gray-300 border focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center",
        color === "primary" &&
          "border-none text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
        className
      )}
      {...props}
    />
  );
}

interface Chip {
  <T extends ElementType = "a">(
    x: PropsWithRef<ButtonProps<T>>
  ): ReactElement | null;
}

export const Chip: Chip = forwardRef(ChipBase) as any;
