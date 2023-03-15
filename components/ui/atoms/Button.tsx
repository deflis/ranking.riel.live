import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
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

export const Button: ButtonType = forwardRef(ButtonBase) as any;
