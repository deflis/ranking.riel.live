import clsx from "clsx";
import {
  Component,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
} from "react";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

function ButtonBase<T extends ElementType = "button">(
  { className, as, ...props }: ButtonProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "button";
  return (
    <Component
      ref={ref as any}
      className={clsx(
        "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
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
