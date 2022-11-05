import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
} from "react";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  color?: "primary";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

function ButtonBase<T extends ElementType = "button">(
  { className, as, color, ...props }: ButtonProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "button";
  return (
    <Component
      ref={ref as any}
      className={clsx(
        "link-reset focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-3 py-2 text-center",
        color === "primary"
          ? "border-none bg-blue-700 text-white  hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          : "bg-white text-black border-gray-300 border focus:ring-blue-300 dark:bg-gray-200 dark:border-slate-300 dark:text-black",
        className
      )}
      {...props}
    />
  );
}

interface ButtonType {
  <T extends ElementType = "button">(
    x: PropsWithRef<ButtonProps<T>>
  ): ReactElement | null;
}

export const Button: ButtonType = forwardRef(ButtonBase) as any;
