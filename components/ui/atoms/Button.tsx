import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  PropsWithRef,
  ReactElement,
  forwardRef,
} from "react";

import styles from "./form.module.css";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  color?: "primary";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

function ButtonBase<T extends ElementType = "button">(
  { className, as, color, type, ...props }: ButtonProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "button";
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={clsx(
        "link-reset",
        styles.button,
        color === "primary" && styles.primary,
        className
      )}
      type={type ?? "button"}
      {...props}
    />
  );
}

interface ButtonType {
  <T extends ElementType = "button">(
    x: PropsWithRef<ButtonProps<T>>
  ): ReactElement | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Button: ButtonType = forwardRef(ButtonBase) as any;
